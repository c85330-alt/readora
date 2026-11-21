import React from 'react';
import { User } from '../types';

interface HeroProps {
  currentUser: User | null;
  onExploreClick: () => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onRequestLogout: () => void;
  onBecomeHostClick: () => void;
  onOpenHostDashboard?: () => void;
}

interface CoffeeMugSvgProps {
  className: string;
}

const CoffeeMugSvg: React.FC<CoffeeMugSvgProps> = ({ className }) => (
  <svg
    aria-hidden="true"
    viewBox="2 -12 70 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Rising Heat / Steam Wisps above Mug */}
    <path
      d="M41 -9C47.5 -4 45.5 0.5 39.5 4C34 7 36 10.5 39.5 12.5"
      stroke="#191919"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M48 -6C52.5 -1.5 49.5 3 42.5 5.5"
      stroke="#191919"
      strokeWidth="2.3"
      strokeLinecap="round"
    />
    <path
      d="M40.5 7.5C40.5 10 42.5 12 45.5 13.5"
      stroke="#191919"
      strokeWidth="2.3"
      strokeLinecap="round"
    />

    {/* Rounded Left Handle */}
    <path
      d="M23 30C12 29 5 35 5 45C5 55 12 60 25 58"
      stroke="#191919"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 36C15.5 35.5 11.5 39 11.5 45C11.5 51 16 53.5 24 52"
      stroke="#191919"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Tall Tapered Ceramic Mug Body */}
    <path
      d="M21 16C20 12 67 6 69 13L64 76C63 82 28 84 26 77L21 16Z"
      fill="#FFFDF4"
      stroke="#191919"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Angled Oval Rim Opening */}
    <path
      d="M21 16C20 9 67 3 69 13C70 21 23 26 21 16Z"
      fill="#FFE57E"
      stroke="#191919"
      strokeWidth="2.8"
      strokeLinejoin="round"
    />

    {/* Rich Coffee Pool Inside Rim */}
    <path
      d="M27 16C30 11.5 59 9 63 14C60 19.5 32 22 27 16Z"
      fill="#191919"
    />

    {/* Hand-Lettered Monoline Cursive 'coffee' matching reference */}
    <g
      transform="rotate(-4 45 49)"
      stroke="#191919"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      {/* c */}
      <path d="M32.8 48.5C31.4 46.8 28.4 47.4 28.1 51.2C27.8 54.5 30.8 55.4 33.4 53.5" />
      {/* o + connector */}
      <path d="M38.6 48.8C37.2 46.8 34 47.5 33.7 51.2C33.4 54.5 36.4 55.3 38.6 53.4C39.9 52 39.6 49.4 38.4 48.6C38.8 49.6 40.2 49.6 41.6 48.6" />
      {/* first f */}
      <path d="M46.2 40.4C45.4 38.8 43.7 39.2 43.2 42.2L41.2 55.8C40.8 58.2 40 59.4 39.1 59.2" />
      {/* second f */}
      <path d="M51.3 39.6C50.4 38 48.7 38.4 48.2 41.4L46.2 55C45.8 57.6 45 58.8 44.1 58.6" />
      {/* shared f crossbar */}
      <path d="M40.6 48.4C43.5 47.8 48 47.8 51.2 48.2" />
      {/* first e */}
      <path d="M50.8 51.4C53.4 51 55.8 49.4 55.3 47.6C54.7 46.2 52.2 46.8 51.5 49.6C50.9 52.4 52.8 54.3 55.8 53.2" />
      {/* second e + ending tail */}
      <path d="M55.8 53.2C57.2 52 61.4 49.8 60.9 47.4C60.3 46 57.8 46.6 57.1 49.4C56.5 52.2 58.6 54.1 61.4 52.8C62.3 52.3 62.9 51.5 63.3 50.6" />
    </g>
  </svg>
);

export const Hero: React.FC<HeroProps> = ({
  currentUser,
  onExploreClick,
  onOpenHostDashboard,
}) => {
  return (
    <section className="pt-24 sm:pt-28 pb-10 sm:pb-12 bg-[#FBF9E9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
        {/* Compact Left-Aligned Poster Block (~568px) */}
        <div className="w-full max-w-[568px]">
          {/* Row 1: 책은 + [Editorial Bookshelf (desktop/tablet)] + 핑계고, + [Compact Bookshelf (mobile right gap)] */}
          <div className="w-full flex items-center justify-start gap-x-2 sm:justify-between sm:gap-x-1.5">
            <h1 className="text-[46px] min-[400px]:text-[52px] sm:text-[64px] md:text-[80px] font-black tracking-[-0.04em] leading-[1.02] text-[#191919] shrink-0">
              책은
            </h1>

            {/* Wide Editorial Bookshelf Row SVG (hidden on mobile, intact on sm+) */}
            <svg
              aria-hidden="true"
              viewBox="0 2 184 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="hidden sm:block sm:w-[168px] sm:h-[68px] md:w-[184px] md:h-[76px] shrink-0"
            >
              {/* Standing Book 1: Coral-Orange with Cream Diamond */}
              <rect x="1" y="13" width="14" height="62" rx="1.5" fill="#F16B47" stroke="#191919" strokeWidth="1.3" />
              <line x1="1" y1="18" x2="15" y2="18" stroke="#FFFDF4" strokeWidth="1.2" />
              <line x1="1" y1="70" x2="15" y2="70" stroke="#FFFDF4" strokeWidth="1.2" />
              <path d="M8 29L12.2 44L8 59L3.8 44L8 29Z" fill="#FFFDF4" fillOpacity="0.85" />

              {/* Standing Book 2: Warm Yellow */}
              <rect x="15" y="21" width="12" height="54" rx="1.2" fill="#FFE57E" stroke="#191919" strokeWidth="1.3" />
              <line x1="15" y1="27" x2="27" y2="27" stroke="#191919" strokeWidth="1.1" />
              <rect x="18" y="32" width="6" height="36" rx="1" stroke="#191919" strokeOpacity="0.55" strokeWidth="1" />

              {/* Standing Book 3: Charcoal with Yellow Band */}
              <rect x="27" y="7" width="10" height="68" rx="1.2" fill="#191919" stroke="#191919" strokeWidth="1.2" />
              <line x1="27" y1="12" x2="37" y2="12" stroke="#FFE57E" strokeWidth="1.4" />
              <line x1="27" y1="70" x2="37" y2="70" stroke="#FFE57E" strokeWidth="1.4" />
              <rect x="29.5" y="17" width="5" height="48" stroke="#FFE57E" strokeOpacity="0.65" strokeWidth="0.9" />

              {/* Standing Book 4: Sky Blue */}
              <rect x="37" y="12" width="10" height="63" rx="1.2" fill="#B9D8E6" stroke="#191919" strokeWidth="1.3" />
              <rect x="39.5" y="21" width="5" height="40" rx="2.5" fill="#FFFDF4" fillOpacity="0.85" />
              <line x1="37" y1="67" x2="47" y2="67" stroke="#F16B47" strokeWidth="1.5" />

              {/* Classic Trio Series: I, II, III */}
              {/* Series I (Muted Sage-Blue) */}
              <rect x="47" y="18" width="14" height="57" rx="1.2" fill="#6CA3BF" stroke="#191919" strokeWidth="1.3" />
              <line x1="47" y1="24" x2="61" y2="24" stroke="#FFE57E" strokeWidth="1.5" />
              <line x1="47" y1="68" x2="61" y2="68" stroke="#FFE57E" strokeWidth="1.5" />
              <ellipse cx="54" cy="46" rx="4" ry="9" fill="#FFFDF4" />
              <line x1="54" y1="41" x2="54" y2="51" stroke="#191919" strokeWidth="1.4" strokeLinecap="round" />

              {/* Series II (Warm Yellow) */}
              <rect x="61" y="18" width="14" height="57" rx="1.2" fill="#FFE57E" stroke="#191919" strokeWidth="1.3" />
              <line x1="61" y1="24" x2="75" y2="24" stroke="#F16B47" strokeWidth="1.5" />
              <line x1="61" y1="68" x2="75" y2="68" stroke="#F16B47" strokeWidth="1.5" />
              <ellipse cx="68" cy="46" rx="4" ry="9" fill="#FFFDF4" />
              <line x1="66.5" y1="41" x2="66.5" y2="51" stroke="#191919" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="69.5" y1="41" x2="69.5" y2="51" stroke="#191919" strokeWidth="1.3" strokeLinecap="round" />

              {/* Series III (Coral-Orange) */}
              <rect x="75" y="18" width="14" height="57" rx="1.2" fill="#F16B47" stroke="#191919" strokeWidth="1.3" />
              <line x1="75" y1="24" x2="89" y2="24" stroke="#191919" strokeWidth="1.3" />
              <line x1="75" y1="68" x2="89" y2="68" stroke="#191919" strokeWidth="1.3" />
              <ellipse cx="82" cy="46" rx="4.2" ry="9" fill="#FFFDF4" />
              <line x1="80" y1="41" x2="80" y2="51" stroke="#191919" strokeWidth="1.15" strokeLinecap="round" />
              <line x1="82" y1="41" x2="82" y2="51" stroke="#191919" strokeWidth="1.15" strokeLinecap="round" />
              <line x1="84" y1="41" x2="84" y2="51" stroke="#191919" strokeWidth="1.15" strokeLinecap="round" />

              {/* Tall Slender Book + Cream Pocket Book */}
              <rect x="89" y="3" width="8.5" height="72" rx="1" fill="#191919" stroke="#191919" strokeWidth="1.2" />
              <rect x="91" y="16" width="4.5" height="44" rx="1" fill="#B9D8E6" />
              <rect x="97.5" y="9" width="9" height="66" rx="1" fill="#FFE57E" stroke="#191919" strokeWidth="1.3" />
              <rect x="99.5" y="18" width="5" height="46" rx="1" fill="#F16B47" />
              <rect x="106.5" y="32" width="11" height="43" rx="1" fill="#FFFDF4" stroke="#191919" strokeWidth="1.3" />
              <line x1="109" y1="44" x2="115" y2="47" stroke="#191919" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="109" y1="50" x2="115" y2="53" stroke="#191919" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="109" y1="56" x2="115" y2="59" stroke="#191919" strokeWidth="1.4" strokeLinecap="round" />

              {/* Horizontal Book Stack on Right */}
              {/* Bottom Stacked Book (Charcoal) */}
              <rect x="119" y="64" width="46" height="11" rx="1.5" fill="#191919" stroke="#191919" strokeWidth="1.2" />
              <rect x="128" y="66.8" width="28" height="5.4" rx="2.7" fill="#B9D8E6" />
              {/* Middle Stacked Book (Coral) */}
              <rect x="122" y="54" width="40" height="10" rx="1.5" fill="#F16B47" stroke="#191919" strokeWidth="1.2" />
              <rect x="127" y="56.5" width="26" height="5" stroke="#FFE57E" strokeWidth="1" />
              {/* Upper-Middle Stacked Book (Yellow) */}
              <rect x="126" y="44" width="32" height="10" rx="1.5" fill="#FFE57E" stroke="#191919" strokeWidth="1.2" />
              <line x1="150" y1="44" x2="150" y2="54" stroke="#191919" strokeWidth="1.2" />
              {/* Green-Blue Diamond Book */}
              <rect x="123" y="32" width="38" height="12" rx="1.5" fill="#6CA3BF" stroke="#191919" strokeWidth="1.2" />
              <path d="M142 34.5L151 38L142 41.5L133 38L142 34.5Z" fill="#FFFDF4" />
              {/* Top Open Cream-Edge Book + Dangling Red/Orange Bookmark */}
              <rect x="120" y="18" width="39" height="14" rx="2.5" fill="#B9D8E6" stroke="#191919" strokeWidth="1.2" />
              <rect x="124" y="20" width="34" height="10" rx="1" fill="#FFFDF4" />
              <path d="M148 29V39L150.5 36.8L153 39V29H148Z" fill="#F16B47" stroke="#191919" strokeWidth="1" strokeLinejoin="round" />

              {/* Two Leaning Books on Far Right */}
              <g transform="rotate(-14 166 50)">
                <rect x="160" y="16" width="9" height="58" rx="1.2" fill="#FFE57E" stroke="#191919" strokeWidth="1.2" />
                <rect x="162" y="26" width="5" height="36" rx="1" fill="#B9D8E6" />
                <rect x="169" y="16" width="9" height="58" rx="1.2" fill="#191919" stroke="#191919" strokeWidth="1.2" />
                <rect x="171.5" y="25" width="4" height="38" fill="#F16B47" />
              </g>
            </svg>

            <div className="text-[46px] min-[400px]:text-[52px] sm:text-[64px] md:text-[80px] font-black tracking-[-0.04em] leading-[1.02] text-right shrink-0">
              <span className="text-[#F16B47]">핑계</span>
              <span className="text-[#191919]">고,</span>
            </div>

            {/* Compact Editorial Bookshelf SVG in remaining right gap (mobile only) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 88 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:hidden w-[80px] h-[46px] min-[400px]:w-[90px] min-[400px]:h-[52px] shrink-0 ml-0.5"
            >
              {/* Standing Books */}
              <rect x="1" y="10" width="10" height="43" rx="1.2" fill="#F16B47" stroke="#191919" strokeWidth="1.2" />
              <line x1="1" y1="15" x2="11" y2="15" stroke="#FFFDF4" strokeWidth="1" />
              <path d="M6 22L9 32L6 42L3 32L6 22Z" fill="#FFFDF4" fillOpacity="0.85" />

              <rect x="11" y="15" width="9" height="38" rx="1" fill="#FFE57E" stroke="#191919" strokeWidth="1.2" />
              <rect x="13" y="21" width="5" height="26" rx="0.8" stroke="#191919" strokeOpacity="0.5" strokeWidth="0.9" />

              <rect x="20" y="4" width="8" height="49" rx="1" fill="#191919" stroke="#191919" strokeWidth="1.1" />
              <line x1="20" y1="9" x2="28" y2="9" stroke="#FFE57E" strokeWidth="1.2" />
              <line x1="20" y1="48" x2="28" y2="48" stroke="#FFE57E" strokeWidth="1.2" />

              <rect x="28" y="9" width="9" height="44" rx="1" fill="#B9D8E6" stroke="#191919" strokeWidth="1.2" />
              <rect x="30.5" y="16" width="4" height="28" rx="2" fill="#FFFDF4" fillOpacity="0.85" />

              {/* Horizontal Book Stack */}
              <rect x="39" y="44" width="35" height="9" rx="1.2" fill="#191919" stroke="#191919" strokeWidth="1.1" />
              <rect x="46" y="46.5" width="21" height="4" rx="2" fill="#B9D8E6" />

              <rect x="41" y="35" width="31" height="9" rx="1.2" fill="#F16B47" stroke="#191919" strokeWidth="1.1" />
              <rect x="46" y="37.2" width="19" height="4.5" stroke="#FFE57E" strokeWidth="0.9" />

              <rect x="44" y="26" width="25" height="9" rx="1.2" fill="#FFE57E" stroke="#191919" strokeWidth="1.1" />
              <line x1="62" y1="26" x2="62" y2="35" stroke="#191919" strokeWidth="1" />

              <rect x="41" y="16" width="30" height="10" rx="1.2" fill="#6CA3BF" stroke="#191919" strokeWidth="1.1" />
              <path d="M56 18L63 21L56 24L49 21L56 18Z" fill="#FFFDF4" />

              {/* Top Open Cream-Edge Book + Coral Bookmark */}
              <rect x="39" y="6" width="30" height="10" rx="1.8" fill="#B9D8E6" stroke="#191919" strokeWidth="1.1" />
              <rect x="42" y="7.5" width="26" height="7" rx="0.8" fill="#FFFDF4" />
              <path d="M59 14V22L61 20.2L63 22V14H59Z" fill="#F16B47" stroke="#191919" strokeWidth="0.9" strokeLinejoin="round" />

              {/* Leaning Accent Book on Far Right */}
              <g transform="rotate(-12 78 34)">
                <rect x="74" y="12" width="7" height="41" rx="1" fill="#FFE57E" stroke="#191919" strokeWidth="1.1" />
                <rect x="75.5" y="19" width="4" height="25" rx="0.8" fill="#B9D8E6" />
              </g>
            </svg>
          </div>

          {/* Row 2: Subcopy tucked cleanly beside "우리" */}
          <div className="mt-3 w-full flex flex-row items-center justify-start sm:justify-end gap-x-3">
            <div className="flex-initial max-w-[195px] min-[400px]:max-w-[220px] sm:max-w-none sm:flex-1 min-w-0 text-left sm:text-right sm:space-y-1 leading-snug">
              <p className="text-[13px] min-[400px]:text-[13.5px] sm:text-[15px] font-normal text-[#191919] leading-snug">
                캘거리에서 새로운 사람을 만나는 가장 재밌는 방법.
              </p>
              <p className="hidden sm:block text-[12.5px] text-[#191919]/75">
                책 한 권 들고 놀러 오세요. 새로운 사람들과 이야기하고, 웃고, 친구가 되는 시간!
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[46px] min-[400px]:text-[52px] sm:text-[64px] md:text-[80px] font-black tracking-[-0.04em] leading-[1.02] text-[#191919] block">
                우리
              </span>
            </div>
          </div>

          {/* Row 3: 만 + [Coffee Mug SVG (desktop/tablet)] + 나요! | Yellow CTA */}
          <div className="mt-3 w-full flex flex-row items-center justify-start gap-x-2 min-[400px]:gap-x-2.5 sm:justify-between sm:gap-3">
            <div className="inline-flex items-center gap-0 sm:gap-2.5 shrink-0">
              <span className="text-[46px] min-[400px]:text-[52px] sm:text-[64px] md:text-[80px] font-black tracking-[-0.04em] leading-[1.02] text-[#191919]">
                만
              </span>

              {/* Tall Clean Line-Art Ceramic Mug with Steam Wisps & Hand-Lettered 'coffee' (hidden on mobile, intact on sm+) */}
              <span aria-hidden="true" className="hidden sm:inline-flex items-center justify-center shrink-0">
                <CoffeeMugSvg className="hidden sm:block sm:w-[70px] sm:h-[92px] md:w-[80px] md:h-[104px] sm:-mt-3.5 md:-mt-4" />
              </span>

              <span className="text-[46px] min-[400px]:text-[52px] sm:text-[64px] md:text-[80px] font-black tracking-[-0.04em] leading-[1.02] text-[#191919]">
                나요!
              </span>
            </div>

            {/* Coffee Mug SVG in middle space between '만나요!' and CTA (mobile only) */}
            <span aria-hidden="true" className="sm:hidden inline-flex items-center justify-center shrink-0">
              <CoffeeMugSvg className="w-[42px] h-[54px] min-[400px]:w-[48px] min-[400px]:h-[62px] -mt-1.5 min-[400px]:-mt-2" />
            </span>

            <div className="flex flex-col items-start shrink-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={onExploreClick}
                  className="px-3.5 py-2.5 min-[400px]:px-4 min-[400px]:py-2.5 sm:px-7 sm:py-3.5 rounded-xl bg-[#FFE57E] hover:bg-[#191919] text-[#191919] hover:text-[#FFE57E] border border-[#191919]/25 text-xs sm:text-[13px] font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap"
                >
                  다음 모임 구경하기
                </button>

                {currentUser?.role === 'host' && onOpenHostDashboard && (
                  <button
                    onClick={onOpenHostDashboard}
                    className="px-2.5 py-2.5 sm:px-3 sm:py-3 rounded-xl bg-[#FFFDF4] border border-[#191919]/20 text-[11px] sm:text-xs font-bold text-[#F16B47] hover:bg-[#191919] hover:text-[#FFE57E] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    호스트 관리 &rarr;
                  </button>
                )}
              </div>

              <span className="mt-1.5 font-display-en text-[8.5px] sm:text-[9.5px] font-bold tracking-[0.12em] uppercase text-[#191919]/75">
                READ. MEET. REPEAT.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
