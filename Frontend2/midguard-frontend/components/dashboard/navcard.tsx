import Link from "next/link";
function NavCard({ title, href }: any) {
  return (
    <Link href={href}>
      <div className="p-10 text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg text-2xl font-semibold hover:scale-[1.05] hover:border-cyan-400 transition cursor-pointer">
        {title} →
      </div>
    </Link>
  );
}
export default NavCard;