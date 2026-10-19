import Link from "next/link";
import { navigation, site } from "@/config/site";
import { Logo } from "@/components/composite/logo";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { getSpecialities } from "@/lib/content";

export async function SiteFooter() {
  const specialities = await getSpecialities();
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark bg-ink text-mist">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-5 text-sm leading-relaxed">{site.description}</p>
          <WhatsAppLink context={{ kind: "general" }} variant="light" className="mt-6">
            Chat on WhatsApp
          </WhatsAppLink>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="text-sm font-bold tracking-[0.14em] text-white uppercase">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/appointments" className="hover:text-white hover:underline">
                Book an appointment
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-specialities">
          <h2 id="footer-specialities" className="text-sm font-bold tracking-[0.14em] text-white uppercase">
            Specialities
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {specialities.map((s) => (
              <li key={s.slug}>
                <Link href={`/specialities/${s.slug}`} className="hover:text-white hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold tracking-[0.14em] text-white uppercase">Visit us</h2>
          <address className="mt-4 space-y-1 text-sm not-italic">
            <p>{site.address.street}</p>
            <p>
              {site.address.city}, {site.address.region} {site.address.postalCode}
            </p>
          </address>
          <dl className="mt-5 space-y-2 text-sm">
            <div>
              <dt className="inline">Reception: </dt>
              <dd className="inline">
                <a href={`tel:${site.contact.phoneE164}`} className="font-semibold text-white hover:underline">
                  {site.contact.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline">Emergency: </dt>
              <dd className="inline">
                <a href={`tel:${site.contact.emergencyE164}`} className="font-semibold text-white hover:underline">
                  {site.contact.emergencyDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline">Email: </dt>
              <dd className="inline">
                <a href={`mailto:${site.contact.email}`} className="font-semibold text-white hover:underline">
                  {site.contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-mist md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {site.name}. A fictional hospital created as a portfolio demonstration. Contact details are
            examples only.
          </p>
          <p>In a medical emergency, call 108 or go to the nearest emergency department.</p>
        </div>
      </div>
    </footer>
  );
}
