type PrismaXLogoProps = {
  subtitle?: string;
  className?: string;
};

const LOGO_SRC = "/media/logo-prismax.png";

export function PrismaXLogo({
  subtitle = "Hall of Honor",
  className = "",
}: PrismaXLogoProps) {
  return (
    <span className={`prismax-logo ${className}`.trim()}>
      <img
        src={LOGO_SRC}
        alt="Prisma(x)"
        className="prismax-wordmark"
        height={28}
      />
      {subtitle ? <small className="prismax-logo-sub">{subtitle}</small> : null}
    </span>
  );
}
