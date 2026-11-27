//! `cw-pipeline run [--dry-run] [--only greenhouse,remotive]`
//!
//! Collects postings from every source, keeps the junior roles in (or open to) Spain, and either
//! writes JSON (`--dry-run`) or upserts them into Supabase and deactivates postings not seen for
//! seven days. Exit code 2 means "nothing was written because a required secret is missing".

use std::collections::HashSet;
use std::path::PathBuf;
use std::process::ExitCode;

use anyhow::Context;
use clap::{Parser, Subcommand};
use cw_classify::Rules;
use cw_domain::Source;
use cw_pipeline::collect::{classify_all, collect_raw};
use cw_pipeline::config::{bundled_companies, parse_companies};
use cw_pipeline::output::write_json;
use cw_pipeline::store::Store;
use cw_sources::{AdzunaCredentials, HttpClient};

#[derive(Parser)]
#[command(
    name = "cw-pipeline",
    version,
    about = "Junior postings collector for carrera-web"
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Collect postings, then write JSON (--dry-run) or sync them to Supabase.
    Run {
        /// Write JSON to --out-dir instead of touching the database.
        #[arg(long)]
        dry_run: bool,
        /// Only these sources, comma-separated (e.g. greenhouse,remotive).
        #[arg(long, value_delimiter = ',')]
        only: Vec<Source>,
        /// Where --dry-run writes postings.json and summary.json.
        #[arg(long, default_value = "out")]
        out_dir: PathBuf,
        /// Read rules.yaml and companies.yaml from this folder instead of the built-in copies.
        #[arg(long)]
        config_dir: Option<PathBuf>,
    },
}

fn secret(name: &str) -> Option<String> {
    std::env::var(name).ok().filter(|v| !v.is_empty())
}

#[tokio::main]
async fn main() -> ExitCode {
    match run(Cli::parse()).await {
        Ok(code) => code,
        Err(error) => {
            eprintln!("error: {error:#}");
            ExitCode::FAILURE
        }
    }
}

async fn run(cli: Cli) -> anyhow::Result<ExitCode> {
    let Command::Run {
        dry_run,
        only,
        out_dir,
        config_dir,
    } = cli.command;

    let credentials = secret("SUPABASE_URL").zip(secret("SUPABASE_SERVICE_ROLE_KEY"));
    if !dry_run && credentials.is_none() {
        eprintln!("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing: nothing written.");
        return Ok(ExitCode::from(2));
    }

    let (rules, companies) = match &config_dir {
        Some(dir) => {
            let read = |name: &str| {
                std::fs::read_to_string(dir.join(name))
                    .with_context(|| format!("reading {name} in {}", dir.display()))
            };
            (
                Rules::from_yaml(&read("rules.yaml")?)?,
                parse_companies(&read("companies.yaml")?)?,
            )
        }
        None => (Rules::bundled(), bundled_companies()),
    };

    let only: Option<HashSet<Source>> = (!only.is_empty()).then(|| only.into_iter().collect());
    let client = HttpClient::new()?;
    let adzuna = AdzunaCredentials::from_env();
    let mut collected = collect_raw(&client, &companies, only.as_ref(), adzuna.as_ref()).await;
    let postings = classify_all(&collected.raw, &rules, &mut collected.stats);

    for (source, stats) in &collected.stats {
        let skipped = stats
            .skipped
            .as_deref()
            .map(|s| format!(" skipped: {s}"))
            .unwrap_or_default();
        println!(
            "{:16} fetched={:5} kept={:4} errors={}{skipped}",
            source.as_str(),
            stats.fetched,
            stats.kept,
            stats.errors.len()
        );
        for error in &stats.errors {
            eprintln!("    ! {error}");
        }
    }

    if dry_run {
        write_json(&out_dir, &postings, &collected.stats)?;
        println!(
            "dry run: {} postings -> {}",
            postings.len(),
            out_dir.display()
        );
        return Ok(ExitCode::SUCCESS);
    }
    // A total outage must not look like "every posting vanished": write nothing and fail loudly.
    anyhow::ensure!(
        collected.stats.values().any(|s| s.fetched > 0),
        "no source returned any posting; nothing written"
    );
    let (url, key) = credentials.expect("checked above");
    let result = Store::new(&url, &key)?
        .sync(&postings, chrono::Utc::now())
        .await?;
    println!("synced: {result}");
    Ok(ExitCode::SUCCESS)
}
