import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Ticket,
  Calendar,
  Download,
  CheckCircle2,
  Share2,
  Clock,
  Heart,
  Plus
} from 'lucide-react';
import { ConcertGoal, TicketStub } from '../types';

export const MemoriesView: React.FC = () => {
  const {
    concerts,
    transactions,
    collectibles,
    achievements,
    completeConcertWithStub
  } = useApp();

  const [selectedConcertId, setSelectedConcertId] = useState<string>(
    concerts.find(c => c.status === 'completed')?.id || concerts[0]?.id || ''
  );

  // Modal to complete concert & generate stub
  const [isStubModalOpen, setIsStubModalOpen] = useState(false);
  const [targetConcertForStub, setTargetConcertForStub] = useState<ConcertGoal | null>(null);
  const [actualSpendStr, setActualSpendStr] = useState<string>('');
  const [memoText, setMemoText] = useState<string>('');
  const [stubPhoto, setStubPhoto] = useState<string>('/src/assets/images/idol_character_stage_star_1793698980767.jpg');

  // Canvas ref for image download
  const ticketRef = useRef<HTMLDivElement>(null);

  // Completed concerts
  const completedConcerts = concerts.filter(c => c.status === 'completed' && c.ticketStub);
  const activeConcert = concerts.find(c => c.id === selectedConcertId);

  // Open completion modal
  const handleOpenCompleteModal = (concert: ConcertGoal) => {
    setTargetConcertForStub(concert);
    setActualSpendStr(String(concert.budgetPlan.total));
    setMemoText('在現場看到偶像發光的那一刻，所有的等待與自律都值得了！✨');
    setIsStubModalOpen(true);
  };

  const handleGenerateStub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetConcertForStub) return;
    const actualSpend = parseInt(actualSpendStr, 10) || targetConcertForStub.budgetPlan.total;

    completeConcertWithStub(targetConcertForStub.id, {
      photoUrl: stubPhoto,
      memo: memoText.trim() || '難忘的演唱會回憶',
      actualSpend
    });

    setIsStubModalOpen(false);
    setSelectedConcertId(targetConcertForStub.id);
  };

  // Download ticket as image using HTML5 Canvas
  const handleDownloadTicket = () => {
    const targetConcert = activeConcert;
    if (!targetConcert || !targetConcert.ticketStub) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 800, 450);
    grad.addColorStop(0, '#1E1B4B'); // deep indigo
    grad.addColorStop(0.5, '#4C1D95'); // purple
    grad.addColorStop(1, '#831843'); // deep pink
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    // Border line
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 760, 410);

    // Inner dashed line for stub cutoff
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(560, 20);
    ctx.lineTo(560, 430);
    ctx.strokeStyle = '#A78BFA';
    ctx.stroke();
    ctx.setLineDash([]);

    // Title & Artist
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(targetConcert.title.substring(0, 32), 50, 75);

    ctx.fillStyle = '#F472B6';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`藝人：${targetConcert.artist}`, 50, 115);

    // Details
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '16px sans-serif';
    ctx.fillText(`📅 日期：${targetConcert.date || '2026'}`, 50, 155);
    ctx.fillText(`📍 地點：${targetConcert.country} · ${targetConcert.venue}`, 50, 190);
    ctx.fillText(`🎯 原定預算：NT$ ${targetConcert.budgetPlan.total.toLocaleString()}`, 50, 225);
    ctx.fillText(`💸 實際旅程花費：NT$ ${targetConcert.ticketStub.actualSpend.toLocaleString()}`, 50, 260);

    // Memo
    ctx.fillStyle = '#FDE047';
    ctx.font = 'italic 15px sans-serif';
    ctx.fillText(`「${targetConcert.ticketStub.memo.substring(0, 42)}」`, 50, 310);

    // Stub side info
    ctx.fillStyle = '#F472B6';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('STAR WALK', 590, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('演唱會特等紀念票根', 590, 115);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText('PASS CODE: OK-STAR-2026', 590, 155);
    ctx.fillText(`完成日期：${targetConcert.completedAt || '2026'}`, 590, 185);

    // Export image
    const link = document.createElement('a');
    link.download = `TicketStub_${targetConcert.artist}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 2026 Year in Review real calculations
  const yearInReview = useMemo(() => {
    // Idol transactions
    const idolTxs = transactions.filter(t => t.categoryGroup === 'idol' && t.type === 'expense');
    const totalIdolSpend = idolTxs.reduce((sum, t) => sum + t.amount, 0);

    // Top idol category
    const catCounts = new Map<string, number>();
    idolTxs.forEach(t => {
      catCounts.set(t.category, (catCounts.get(t.category) || 0) + t.amount);
    });
    let topCategory = '尚未有追星支出';
    let topCatAmount = 0;
    catCounts.forEach((amt, cat) => {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        topCategory = cat;
      }
    });

    // Top group
    const groupCounts = new Map<string, number>();
    transactions.forEach(t => {
      if (t.detailedItem?.groupName) {
        const g = t.detailedItem.groupName;
        groupCounts.set(g, (groupCounts.get(g) || 0) + 1);
      }
    });
    let topGroup = 'TWICE';
    let maxGCount = 0;
    groupCounts.forEach((count, g) => {
      if (count > maxGCount) {
        maxGCount = count;
        topGroup = g;
      }
    });

    return {
      totalIdolSpend,
      topCategory,
      topGroup,
      collectiblesCount: collectibles.length,
      concertsAttendedCount: completedConcerts.length,
      goalsCount: concerts.length,
      unlockedAchievementsCount: achievements.filter(a => a.isUnlocked).length
    };
  }, [transactions, collectibles, completedConcerts, concerts, achievements]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-pink-500" />
          <span>🎟️ 星途回憶館｜演唱會票根與年度回顧</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          珍藏親自抵達現場的榮耀紀念票根，依據真實數據生成的追星旅程回顧
        </p>
      </div>

      {/* Ticket Stubs Section */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎫 演唱會紀念票根收藏箱</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              已確認完成參加的演唱會方可生成紀念票根（不自行編造假紀錄）
            </p>
          </div>

          {/* List of pending concerts that can be marked complete */}
          <div className="flex items-center gap-2">
            {concerts
              .filter(c => c.status !== 'completed')
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => handleOpenCompleteModal(c)}
                  className="px-3 py-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-900/60 rounded-xl hover:bg-pink-100 transition-colors"
                >
                  ✓ 確認參加【{c.artist}】生成票根
                </button>
              ))}
          </div>
        </div>

        {/* Display selected ticket stub */}
        {activeConcert && activeConcert.ticketStub ? (
          <div className="mt-6 flex flex-col items-center">
            {/* The Ticket Card */}
            <div
              ref={ticketRef}
              className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-950 text-white border-2 border-pink-400/50 relative p-6 sm:p-8"
            >
              {/* Cutout notch circles for realistic ticket stub look */}
              <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-white dark:bg-slate-900" />
              <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-white dark:bg-slate-900" />

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-pink-500 text-white uppercase tracking-wider">
                      CONCERT PASS
                    </span>
                    <span className="text-xs text-pink-300 font-mono">
                      {activeConcert.artist}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    {activeConcert.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-300 pt-1">
                    <div>📅 活動日期：{activeConcert.date || '2026 年度場次'}</div>
                    <div>📍 場館：{activeConcert.country} · {activeConcert.venue}</div>
                    <div className="flex gap-4 pt-1 font-mono">
                      <span>原定預算：NT$ {activeConcert.budgetPlan.total.toLocaleString()}</span>
                      <span className="text-pink-300 font-bold">
                        實際花費：NT$ {activeConcert.ticketStub.actualSpend.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Memorial Note */}
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs italic text-yellow-200 mt-3">
                    「{activeConcert.ticketStub.memo}」
                  </div>
                </div>

                {/* Right side: Photo & Stub barcode */}
                <div className="w-full sm:w-44 shrink-0 flex flex-col items-center justify-between border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-6">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-md">
                    <img
                      src={activeConcert.ticketStub.photoUrl || activeConcert.coverImage}
                      alt={activeConcert.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-3 text-center space-y-1">
                    <div className="text-[10px] text-pink-300 font-mono tracking-widest">
                      STAR-WALK-PASS
                    </div>
                    <div className="text-xs font-bold text-white">
                      已確認到場 🌟
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownloadTicket}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>下載紀念票根圖片 (PNG)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            目前尚無已完成的演唱會紀念票根，當你真正參加完演唱會後，點擊上方按鈕生成專屬紀念卡片！
          </div>
        )}
      </div>

      {/* 2026 Idol Year in Review (追星年度回顧) */}
      <div className="rounded-3xl bg-gradient-to-br from-purple-900/10 via-pink-500/10 to-indigo-900/10 border border-purple-200/80 dark:border-purple-900/40 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-purple-900/50">
          <div>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              ANNUAL RECAP 2026
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              🌟 追星年度足跡回顧
            </h3>
          </div>
          <span className="text-xs text-slate-400">真實記帳資料統計</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">最常追的偶像團體</div>
            <div className="text-base font-black text-pink-600 dark:text-pink-400 mt-1 truncate">
              {yearInReview.topGroup}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">追星總支出</div>
            <div className="text-base font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
              NT$ {yearInReview.totalIdolSpend.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">最大支出類別</div>
            <div className="text-base font-black text-slate-900 dark:text-white mt-1 truncate">
              {yearInReview.topCategory}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">累積周邊收藏品</div>
            <div className="text-base font-black font-mono text-pink-600 dark:text-pink-400 mt-1">
              {yearInReview.collectiblesCount} 件
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">參加演唱會場次</div>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">
              {yearInReview.concertsAttendedCount} 場
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40">
            <div className="text-[11px] text-slate-400">建立追星目標數</div>
            <div className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">
              {yearInReview.goalsCount} 個
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-100 dark:border-purple-900/40 col-span-2">
            <div className="text-[11px] text-slate-400">達成成就總數</div>
            <div className="text-base font-black font-mono text-emerald-500 mt-1">
              {yearInReview.unlockedAchievementsCount} 項榮譽解鎖
            </div>
          </div>
        </div>
      </div>

      {/* Complete Concert & Generate Stub Modal */}
      {isStubModalOpen && targetConcertForStub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span>確認實際參加演唱會並產生紀念票根</span>
            </h3>
            <p className="text-xs text-slate-500">
              演唱會：{targetConcertForStub.title}
            </p>

            <form onSubmit={handleGenerateStub} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  實際旅程總花費 (NT$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualSpendStr}
                  onChange={e => setActualSpendStr(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  現場感動紀念文字
                </label>
                <textarea
                  value={memoText}
                  onChange={e => setMemoText(e.target.value)}
                  placeholder="寫下一句留在心底的話..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStubModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  產生珍藏紀念票根
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
