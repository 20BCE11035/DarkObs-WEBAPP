import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import TypedText from "@/components/TypedText";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowDownToLine, CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

const perks = [
  {
    name: "Instant Access",
    Icon: ArrowDownToLine,
    description:
      "Download your cybersecurity tools and scripts instantly after purchase. No waiting time, start securing your systems now.",
  },
  {
    name: "Verified Security",
    Icon: CheckCircle,
    description:
      "Every tool and script is thoroughly reviewed by our experts to ensure security, efficiency, and reliability. Not satisfied? Enjoy a 30-day refund guarantee.",
  },
  {
    name: "Ethical & Responsible",
    Icon: ShieldCheck,
    description:
      "We support ethical hacking and responsible cybersecurity practices. A portion of our proceeds goes to cybersecurity education and open-source initiatives.",
  },
];

export default function Home() {
  return (
    <>
      <MaxWidthWrapper>
        <div className="py-20 mx-auto text-center flex flex-col items-center max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-white-900 sm:text-6xl">
            Your marketplace for high-quality{" "}
            <span className="text-red-600"><TypedText /></span>.
          </h1>
          <p className="mt-6 text-lg max-w-prose text-muted-foreground">
            Welcome to DarkObs. Every Tool on our platform is verified by
            our team to ensure our highest quality standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link href="/products" className={buttonVariants()}>
              Browse Trending
            </Link>
            {/* <Button variant="ghost">Our quality promise &rarr;</Button> */}
          </div>
        </div>

        <ProductReel
          query={{ sort: "desc", limit: 4 }}
          href="/products?sort=recent"
          title="Brand new"
        />
      </MaxWidthWrapper>

      <section className="border-t border-red-900 bg-[#070A16]">
        <MaxWidthWrapper className="py-20">
          <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {perks.map((perk) => (
              <div
                key={perk.name}
                className="text-center md:flex md:items-start md:text-left lg:block lg:text-center"
              >
                <div className="md:flex-shrink-0 flex justify-center">
                  <div className="h-20   w-20 flex items-center justify-center rounded-full bg-black-500 text-red-900">
                    {<perk.Icon className="w-2/3 h-2/3" />}
                  </div>
                </div>

                <div className="mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6">
                  <h3 className="text-base font-medium text-white-900">
                    {perk.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}
