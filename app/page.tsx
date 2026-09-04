import type { Metadata } from "next";
import Image from "next/image";
import { APP_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/translations";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { FeatureSection } from "@/components/marketing/FeatureSection";
import { HowItWorks, Testimonials, Faq, FinalCta } from "@/components/marketing/SupportSections";
import { SoftwareApplicationJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: `${SITE_NAME} — CRM for service businesses`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: APP_URL },
  openGraph: {
    url: APP_URL,
    title: `${SITE_NAME} — CRM for service businesses`,
    description: SITE_DESCRIPTION,
  },
};

export default function HomePage() {
  const dict = getDictionary(getLocale());

  return (
    <>
      <SoftwareApplicationJsonLd />
      <Header />
      <main>
        <Hero />

        <FeatureSection
          id="features"
          eyebrow={dict.home.featureCustomersEyebrow}
          heading={dict.home.featureCustomersHeading}
          description={dict.home.featureCustomersDescription}
          bullets={[
            dict.home.featureCustomersBullet1,
            dict.home.featureCustomersBullet2,
            dict.home.featureCustomersBullet3,
          ]}
          visual={
            <Image
              src="/illustrations/customers.jpg"
              alt="Customer record with contact details, linked jobs, and activity history"
              width={1168}
              height={784}
              className="h-auto w-full"
            />
          }
        />

        <FeatureSection
          eyebrow={dict.home.featurePipelineEyebrow}
          heading={dict.home.featurePipelineHeading}
          description={dict.home.featurePipelineDescription}
          bullets={[
            dict.home.featurePipelineBullet1,
            dict.home.featurePipelineBullet2,
            dict.home.featurePipelineBullet3,
          ]}
          visual={
            <Image
              src="/illustrations/leads-pipeline.jpg"
              alt="Lead pipeline board with columns for new, contacted, quoted, and won leads"
              width={1168}
              height={784}
              className="h-auto w-full"
            />
          }
          reversed
        />

        <FeatureSection
          eyebrow={dict.home.featureJobsEyebrow}
          heading={dict.home.featureJobsHeading}
          description={dict.home.featureJobsDescription}
          bullets={[
            dict.home.featureJobsBullet1,
            dict.home.featureJobsBullet2,
            dict.home.featureJobsBullet3,
          ]}
          visual={
            <Image
              src="/illustrations/jobs-tasks.jpg"
              alt="Jobs and tasks checklist with status and due dates"
              width={1168}
              height={784}
              className="h-auto w-full"
            />
          }
        />

        <FeatureSection
          eyebrow={dict.home.featureApptEyebrow}
          heading={dict.home.featureApptHeading}
          description={dict.home.featureApptDescription}
          bullets={[
            dict.home.featureApptBullet1,
            dict.home.featureApptBullet2,
            dict.home.featureApptBullet3,
          ]}
          visual={
            <Image
              src="/illustrations/appointments.jpg"
              alt="Calendar view of scheduled appointments for the day"
              width={1168}
              height={784}
              className="h-auto w-full"
            />
          }
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
