"use client";

const categories = [
  {
    title: "السفر",
    count: 35,
    color: "bg-cyan-500",
  },
  {
    title: "الرعب",
    count: 18,
    color: "bg-red-500",
  },
  {
    title: "الأعمال",
    count: 42,
    color: "bg-violet-500",
  },
  {
    title: "الرومانسية",
    count: 27,
    color: "bg-pink-500",
  },
  {
    title: "الخيال",
    count: 31,
    color: "bg-emerald-500",
  },
];

export default function CategoriesWidget() {
  return (
    <div className="rounded-[30px] border border-white/5 bg-[#101623] p-7">

      <h3 className="mb-7 text-xl font-bold text-white">
        التصنيفات
      </h3>

      <div className="space-y-4">

        {categories.map((category) => (

          <button
            key={category.title}
            className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
          >

            <div className="flex items-center gap-3">

              <div
                className={`h-3 w-3 rounded-full ${category.color}`}
              />

              <span className="font-medium text-white">
                {category.title}
              </span>

            </div>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
              {category.count}
            </span>

          </button>

        ))}

      </div>

    </div>
  );
}