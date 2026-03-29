interface AuthorProps {
  name: string;
  bio: string;
  role?: string;
}

export default function AuthorSection({ name, bio, role }: AuthorProps) {
  if (!name && !bio) return null;

  return (
    <aside className="mt-12 sm:mt-16">
      <div className="bg-[#f6f4f0] border border-[#ddd] rounded-sm px-6 sm:px-8 py-10 sm:py-12">
        <h3 className="font-sans font-medium text-sm uppercase tracking-widest text-ink-muted mb-6">
          Om författaren
        </h3>
        {name && (
          <p className="text-xl sm:text-2xl font-medium text-ink mb-1">{name}</p>
        )}
        {role && (
          <p className="text-sm font-sans text-ink-muted mb-4">{role}</p>
        )}
        {bio && (
          <p className="text-base sm:text-lg leading-loose text-ink-light">{bio}</p>
        )}
      </div>
    </aside>
  );
}
