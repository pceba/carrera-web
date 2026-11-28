import { Heading, Kicker, Page } from "@/components/ui";
import { PostingsSkeleton } from "@/components/postings/PostingsSkeleton";
import styles from "./ofertas.module.css";

export default function Loading() {
  return (
    <Page>
      <header className={styles.hero}>
        <Kicker>Ofertas</Kicker>
        <Heading level="display">
          Ofertas junior <em>en España</em>
        </Heading>
      </header>
      <PostingsSkeleton />
    </Page>
  );
}
