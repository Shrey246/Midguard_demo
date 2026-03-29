// =============================
// COMPONENT: NavItem
// =============================
import Link from "next/link";
function NavItem({ href, icon, label, pathname }: any) {
  const active = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition ${
          active
            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-black"
            : "text-gray-300 hover:bg-white/10"
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default NavItem;