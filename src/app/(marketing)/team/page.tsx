import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = { title: "Team" };

// Resolve each headshot to whatever extension is actually on disk, so renaming
// the source files (.jpeg <-> .png) never breaks the page. Runs at build time
// since this route is statically rendered.
const teamFiles = fs.readdirSync(path.join(process.cwd(), "public", "team"));
function teamImage(basename: string): string {
  const file = teamFiles.find((f) => f.slice(0, f.lastIndexOf(".")) === basename);
  return `/team/${file ?? `${basename}.jpeg`}`;
}

const team: { name: string; role: string; image: string }[] = [
  { name: "Oluwaseun Bamidele", role: "Chief Executive Officer", image: teamImage("Oluwaseun Bamidele- CEO") },
  { name: "Sarah Bamidele", role: "Head, Marketing & Sales", image: teamImage("Sarah Bamidele- Head, Marketing and Sales") },
  { name: "Tomisin Komolafe", role: "Head of Engineering", image: teamImage("Tomisin Komolafe- Head of Engineering Department") },
  { name: "Dada Temitope", role: "Human Resources", image: teamImage("Dada Temitope- HR") },
  { name: "Daniel Igho", role: "Administrative Executive", image: teamImage("Daniel Igho- Administrative Executive") },
  { name: "Jane Jonah", role: "Sales Executive", image: teamImage("Jane Jonah - Sales Executive") },
];

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="The people building CT Edge Ltd."
        description="A team of professionals across leadership, engineering, marketing, sales, and operations — committed to delivering secure property and long-term value across Nigeria."
      />
      <div className="container-x py-16">
        <section className="mx-auto max-w-3xl animate-slide-up text-center">
          <h2 className="text-2xl font-bold text-slate-900">Leadership &amp; team</h2>
          <p className="mt-4 text-slate-600">
            Behind every CT Edge project is a team committed to integrity, excellence, and long-term
            value. Spanning leadership, engineering, marketing, sales, and operations, our people
            bring the expertise and care that turn secure property and sound investment into reality
            for the families and investors who build wealth with us.
          </p>
        </section>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
          {team.map((member, idx) => (
            <div
              key={member.name}
              className="animate-slide-up flex flex-col items-center text-center"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="relative h-42 w-42 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 sm:h-36 sm:w-36">
                <Image
                  src={encodeURI(member.image)}
                  alt={`${member.name}, ${member.role}`}
                  fill
                  sizes="144px"
                  className="object-cover object-top"
                  priority={idx < 3}
                />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-teal-700">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
