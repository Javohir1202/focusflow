import type { Metadata } from "next";
import { APP_URL, SITE_DESCRIPTION } from "@/lib/config";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { HowItWorks, Testimonials, Faq, FinalCta } from "@/components/marketing/SupportSections";
import { SoftwareApplicationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "FocusFlow — AI Productivity Dashboard",
  description: SITE_DESCRIPTION,
  alternates: { canonical: APP_URL },
  openGraph: {
    url: APP_URL,
    title: "FocusFlow — AI Productivity Dashboard",
    description: SITE_DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <>
      <SoftwareApplicationJsonLd />
      <Header />
      <main>
        <Hero />

        <FeatureSection
          id="features"
          eyebrow="Features"
          heading="Everything you need to stay focused"
          description="Tasks, projects, and AI planning, all in one clean dashboard."
          bullets={[
            "Unified task and project view",
            "Deadline and priority tracking",
            "Cross-device sync",
            "Built-in productivity analytics",
          ]}
          imageSrc="/features-overview.png"
          imageAlt="Overview of the FocusFlow dashboard showing tasks, projects, and priorities"
        />

        <FeatureSection
          eyebrow="AI Task Breakdown"
          heading="Turn big, vague tasks into a clear checklist"
          description="Describe a task in plain language and Claude breaks it into ordered, time-estimated steps with priorities."
          bullets={[
            'Example: "Build an e-commerce website" becomes a structured task list',
            "Each step includes an estimated duration",
            "Priorities are assigned automatically",
          ]}
          imageSrc="/ai-breakdown.png"
          imageAlt="AI task breakdown feature splitting a large task into smaller subtasks"
          reversed
        />

        <FeatureSection
          eyebrow="AI Daily Planner"
          heading="Wake up to an optimized schedule"
          description="FocusFlow looks at your incomplete tasks, deadlines, and priorities, and builds a realistic plan for the day."
          bullets={[
            "Accounts for your current time and remaining hours",
            "Explains why each task was scheduled when it was",
            "Adjusts as priorities and deadlines change",
          ]}
          imageSrc="/ai-daily-plan.png"
          imageAlt="AI-generated daily schedule with time blocks for each task"
        />

        <FeatureSection
          eyebrow="Productivity Analytics"
          heading="See where your time actually goes"
          description="Track completion rates, time spent per project, and productivity trends over time."
          bullets={[
            "Weekly and monthly trend views",
            "Breakdown by project and priority",
            "Spot patterns in your focus time",
          ]}
          imageSrc="/analytics.png"
          imageAlt="Productivity analytics dashboard with charts of completed tasks over time"
          reversed
        />

        <FeatureSection
          eyebrow="Projects & Tasks"
          heading="Organize work the way you think"
          description="Group tasks into projects, set deadlines, and keep everything in one place."
          bullets={[
            "Flexible project structure",
            "Filter and sort by priority or deadline",
            "Quick task creation from anywhere",
          ]}
          imageSrc="/projects-tasks.png"
          imageAlt="Projects and tasks list view in the FocusFlow dashboard"
        />

        <FeatureSection
          eyebrow="Cross-device sync"
          heading="Your plan, everywhere you are"
          description="Start on your laptop, check your plan on your phone. Everything stays in sync automatically."
          bullets={[
            "Real-time sync across devices",
            "Secure authentication",
            "Works in any modern browser",
          ]}
          imageSrc="/cross-device-sync.png"
          imageAlt="FocusFlow dashboard synced across a laptop and a phone"
          reversed
        />

        <HowItWorks />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
