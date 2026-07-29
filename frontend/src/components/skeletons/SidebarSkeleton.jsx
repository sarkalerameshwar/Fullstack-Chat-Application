const SidebarSkeleton = () => {
  const skeletonContacts = Array(6).fill(null);

  return (
    <aside className="flex h-full w-full flex-col lg:w-80">
      <div className="hidden shrink-0 border-b border-base-300 px-4 pb-3 pt-3 lg:block lg:py-3">
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4 py-3">
            <div className="skeleton size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
