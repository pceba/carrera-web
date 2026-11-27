//! `cw-alerts run [--dry-run] [--preview]`
//!
//! Reads subscribers and new postings from Supabase when `SUPABASE_URL` and
//! `SUPABASE_SERVICE_ROLE_KEY` are set, otherwise uses fictional demo data (always a dry run).
//! Sends through Resend only when `RESEND_API_KEY` and `ALERTS_FROM` are set and `--dry-run` is
//! absent. The log holds counts only: never an address, a token or a posting.

use std::process::ExitCode;

use anyhow::bail;
use chrono::{Duration, Utc};
use clap::{Parser, Subcommand};
use cw_alerts::digest::{self, FIRST_WINDOW_DAYS};
use cw_alerts::run::{DEFAULT_MAX_EMAILS, Delivery, Settings, prepare, run};
use cw_alerts::store::Store;
use cw_alerts::{demo, render, resend};

#[derive(Parser)]
#[command(
    name = "cw-alerts",
    version,
    about = "Daily digest of new postings for carrera-web"
)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Build the digests and send them (or only count them in a dry run).
    Run {
        /// Never send, even if a Resend key is present.
        #[arg(long)]
        dry_run: bool,
        /// Print the first rendered email. Only allowed with the fictional demo data.
        #[arg(long)]
        preview: bool,
        /// Emails per run (Resend free tier: 100 a day).
        #[arg(long, default_value_t = DEFAULT_MAX_EMAILS)]
        max_emails: usize,
    },
}

fn secret(name: &str) -> Option<String> {
    std::env::var(name).ok().filter(|v| !v.is_empty())
}

#[tokio::main]
async fn main() -> ExitCode {
    match execute(Cli::parse()).await {
        Ok(code) => code,
        Err(error) => {
            eprintln!("error: {error:#}");
            ExitCode::FAILURE
        }
    }
}

async fn execute(cli: Cli) -> anyhow::Result<ExitCode> {
    let Command::Run {
        dry_run,
        preview,
        max_emails,
    } = cli.command;
    let now = Utc::now();
    let site_url = secret("SITE_URL").unwrap_or_else(|| "https://carrera-web.example".into());

    let store = match (secret("SUPABASE_URL"), secret("SUPABASE_SERVICE_ROLE_KEY")) {
        (Some(url), Some(key)) => Some(Store::new(&url, &key)?),
        _ => None,
    };
    if preview && store.is_some() {
        bail!(
            "--preview prints an email, so it only works with the demo data (no Supabase secrets)"
        );
    }

    let (recipients, candidates) = match &store {
        Some(store) => {
            let recipients = store.recipients().await?;
            let since = recipients
                .iter()
                .map(|r| digest::since(r, now))
                .min()
                .unwrap_or_else(|| now - Duration::days(FIRST_WINDOW_DAYS));
            (recipients, store.candidates(since).await?)
        }
        None => {
            println!(
                "mode=demo (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; fictional data)"
            );
            (demo::recipients(now), demo::candidates(now))
        }
    };

    let mailer = match (store.is_some() && !dry_run, secret("RESEND_API_KEY")) {
        (true, Some(key)) => {
            let Some(from) = secret("ALERTS_FROM") else {
                bail!("RESEND_API_KEY is set but ALERTS_FROM is not");
            };
            let url = secret("RESEND_API_URL").unwrap_or_else(|| resend::API_URL.into());
            Some(resend::Resend::new(&url, &key, &from)?)
        }
        _ => None,
    };
    println!("mode={}", if mailer.is_some() { "send" } else { "dry-run" });

    if preview {
        let digests = prepare(&recipients, &candidates, now);
        if let Some(first) = digests.first() {
            let email = render::render(first, &site_url);
            println!("--- subject: {}\n{}", email.subject, email.text);
        }
    }

    let report = run(
        &recipients,
        &candidates,
        &Delivery {
            mailer: mailer.as_ref(),
            store: store.as_ref(),
        },
        &Settings {
            site_url: &site_url,
            max_emails,
        },
        now,
    )
    .await;
    println!("{report}");
    Ok(if report.failed > 0 {
        ExitCode::FAILURE
    } else {
        ExitCode::SUCCESS
    })
}
