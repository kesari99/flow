type AuthHeroProps = {
  imageUrl: string;
};

export function AuthHero({ imageUrl }: AuthHeroProps) {
  return (
    <div className="auth-hero relative hidden min-h-screen overflow-hidden lg:block">
      <img
        src={imageUrl}
        alt="Abstract workspace lighting and architecture"
        className="auth-hero-image absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
      <div className="absolute inset-0 flex flex-col justify-between p-10 text-white">
        <p className="auth-hero-brand text-3xl font-semibold tracking-tight">
          Promptflow
        </p>
        <div className="auth-hero-copy max-w-md space-y-3">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Design AI chat flows that ship.
          </h1>
          <p className="text-sm leading-relaxed text-white/75">
            Compose nodes, version graphs, and run OpenAI-backed conversations
            from one workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
