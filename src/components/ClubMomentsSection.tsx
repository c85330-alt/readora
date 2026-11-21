import React from 'react';

export interface ClubMoment {
  id: string;
  title: string;
  clubName: string;
  date: string;
  quote: string;
  imageUrl?: string;
}

interface ClubMomentsSectionProps {
  moments?: ClubMoment[];
}

export const ClubMomentsSection: React.FC<ClubMomentsSectionProps> = ({ moments = [] }) => {
  // Never fabricate fake reviews or participant photos when no real moments exist
  if (!moments || moments.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-[#FBF9E9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-display-en text-xs font-bold tracking-[0.16em] uppercase text-[#191919]/55 mb-3">
            CLUB MOMENTS
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#191919]">
            우리, 이렇게 놀아요!
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {moments.map((moment) => (
            <article
              key={moment.id}
              className="bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 overflow-hidden flex flex-col justify-between"
            >
              {moment.imageUrl && (
                <div className="aspect-[4/3] bg-[#191919]/5 overflow-hidden border-b border-[#191919]/10">
                  <img
                    src={moment.imageUrl}
                    alt={moment.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-[#191919]/85 leading-relaxed">
                  {moment.quote}
                </p>
                <div className="pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs text-[#191919]/60">
                  <span className="font-bold text-[#191919]">{moment.clubName}</span>
                  <span>{moment.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
