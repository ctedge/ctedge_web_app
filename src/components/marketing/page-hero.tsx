type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  overlay?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image = "/hero-image.jpg",
  overlay = "bg-black/60",
}: PageHeroProps) {
  return (
    <section
      className="relative bg-slate-900 bg-no-repeat bg-cover bg-center text-white"
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className={`absolute inset-0 z-0 ${overlay}`} />
      <div className="container-x relative z-10 py-16 md:py-20">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-bold md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm text-teal-50/90 md:text-base">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
