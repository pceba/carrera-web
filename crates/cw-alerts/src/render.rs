//! Spanish email bodies: plain text and simple HTML (no images, no tracking pixels).

use crate::digest::Digest;

/// What Resend needs for one email.
#[derive(Debug, PartialEq, Eq)]
pub struct Email {
    pub subject: String,
    pub text: String,
    pub html: String,
    pub unsubscribe_url: String,
}

/// Where the unsubscribe link points. The route is built in WS-F2 (`/alertas/baja`).
pub fn unsubscribe_url(site_url: &str, token: &str) -> String {
    format!(
        "{}/alertas/baja?token={token}",
        site_url.trim_end_matches('/')
    )
}

fn place(posting: &cw_domain::Posting) -> Option<&str> {
    posting
        .city
        .as_deref()
        .or(posting.location.as_deref())
        .filter(|p| !p.trim().is_empty())
}

pub fn subject(count: usize) -> String {
    if count == 1 {
        "1 oferta nueva que encaja contigo".to_owned()
    } else {
        format!("{count} ofertas nuevas que encajan contigo")
    }
}

const NOTE: &str = "El orden es una ayuda, no un veredicto: solo vemos el título y el lugar de cada oferta, no su descripción. Revisa siempre la oferta original.";

pub fn render(digest: &Digest<'_>, site_url: &str) -> Email {
    let unsubscribe = unsubscribe_url(site_url, &digest.recipient.unsubscribe_token);
    let mut text =
        String::from("Hola,\n\nEstas son las ofertas nuevas que mejor encajan con tu perfil:\n");
    let mut list = String::new();
    for (i, item) in digest.items.iter().enumerate() {
        let posting = item.posting;
        let place_text = place(posting)
            .map(|p| format!(" ({p})"))
            .unwrap_or_default();
        let reasons = item.reasons.join("; ");
        text.push_str(&format!(
            "\n{}. {} — {}{}\n",
            i + 1,
            posting.title,
            posting.company,
            place_text
        ));
        if !reasons.is_empty() {
            text.push_str(&format!("   Por qué: {reasons}\n"));
        }
        text.push_str(&format!("   {}\n", posting.source_url));

        list.push_str(&format!(
            "<li><p><a href=\"{}\">{}</a> — {}{}",
            escape(&posting.source_url),
            escape(&posting.title),
            escape(&posting.company),
            escape(&place_text)
        ));
        if !reasons.is_empty() {
            list.push_str(&format!("<br><small>Por qué: {}</small>", escape(&reasons)));
        }
        list.push_str("</p></li>\n");
    }
    text.push_str(&format!(
        "\n{NOTE}\n\nRecibes este resumen diario porque activaste las alertas. Para dejar de recibirlo: {unsubscribe}\n"
    ));
    let html = format!(
        "<!doctype html>\n<html lang=\"es\"><body>\n<p>Hola,</p>\n<p>Estas son las ofertas nuevas que mejor encajan con tu perfil:</p>\n<ol>\n{list}</ol>\n<p><small>{NOTE}</small></p>\n<p><small>Recibes este resumen diario porque activaste las alertas. <a href=\"{}\">Darme de baja</a>.</small></p>\n</body></html>\n",
        escape(&unsubscribe)
    );
    Email {
        subject: subject(digest.items.len()),
        text,
        html,
        unsubscribe_url: unsubscribe,
    }
}

fn escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            _ => out.push(c),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{demo, digest};
    use chrono::Utc;

    #[test]
    fn subject_agrees_in_number() {
        assert_eq!(subject(1), "1 oferta nueva que encaja contigo");
        assert_eq!(subject(4), "4 ofertas nuevas que encajan contigo");
    }

    #[test]
    fn email_has_every_posting_and_the_unsubscribe_link() {
        let now = Utc::now();
        let recipients = demo::recipients(now);
        let candidates = demo::candidates(now);
        let digests = digest::build(
            &recipients,
            &candidates,
            &cw_lexicon::Lexicon::bundled(),
            now,
        );
        let email = render(&digests[0], "https://site.example/");
        assert_eq!(email.subject, subject(digests[0].items.len()));
        assert!(email.text.contains("Junior Data Analyst"));
        assert!(email.text.contains("https://example.com/d1"));
        for body in [&email.text, &email.html] {
            assert!(body.contains("https://site.example/alertas/baja?token=demo-token-1"));
        }
        assert!(email.html.contains("lang=\"es\""));
        // The address must never appear in the body.
        assert!(!email.text.contains("ana@") && !email.html.contains("ana@"));
    }

    #[test]
    fn html_escapes_posting_text() {
        assert_eq!(
            escape("<b>\"A&B\"</b>"),
            "&lt;b&gt;&quot;A&amp;B&quot;&lt;/b&gt;"
        );
    }
}
