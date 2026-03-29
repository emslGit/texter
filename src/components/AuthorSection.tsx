interface AuthorProps {
  name: string;
  bio: string;
  role?: string;
}

export default function AuthorSection({ name, bio, role }: AuthorProps) {
  if (!name && !bio) return null;

  return (
    <aside className="mt-12 sm:mt-16">
      <div className="bg-[#c8aa82]/[0.06] border border-accent/20 rounded-sm px-6 sm:px-8 py-10 sm:py-12">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/ingegerd.jpg`}
            alt={name}
            className="w-24 h-28 object-cover object-top flex-shrink-0"
          />
          <div>
            <h3 className="font-sans font-medium text-sm uppercase tracking-widest text-ink-muted mb-2">
              Om författaren
            </h3>
            {name && (
              <p className="text-xl sm:text-2xl font-medium text-ink mb-1">{name}</p>
            )}
            {role && (
              <p className="text-sm font-sans text-ink-muted">{role}</p>
            )}
          </div>
        </div>
        {bio && (
          <p className="text-base sm:text-lg leading-loose text-ink-light">{bio}</p>
        )}
      </div>
    </aside>
  );
}
