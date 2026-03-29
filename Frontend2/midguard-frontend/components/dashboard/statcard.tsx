function StatCard({ title, value }: any) {
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-lg hover:scale-[1.02] transition">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
}
export default StatCard;