import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  Download,
  Sparkles,
  X
} from 'lucide-react';
import { ConcertGoal } from '../types';
import { HandDrawnSticker } from '../components/HandDrawnSticker';
import { DEFAULT_CONCERT_COVER } from '../assets/defaultAvatars';

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
  const [stubPhoto, setStubPhoto] = useState<string>(DEFAULT_CONCERT_COVER);

  const ticketRef = useRef<HTMLDivElement>(null);

  const completedConcerts = concerts.filter(c => c.status === 'completed' && c.ticketStub);
  const activeConcert = concerts.find(c => c.id === selectedConcertId);

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
    grad.addColorStop(0, '#FFFDF7');
    grad.addColorStop(1, '#FFE3EC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    ctx.strokeStyle = '#4A3728';
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 20, 760, 410);

    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(560, 20);
    ctx.lineTo(560, 430);
    ctx.strokeStyle = '#4A3728';
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#4A3728';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(targetConcert.title.substring(0, 32), 50, 75);

    ctx.fillStyle = '#FF5C8A';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`藝人：${targetConcert.artist}`, 50, 115);

    ctx.fillStyle = '#4A3728';
    ctx.font = '16px sans-serif';
    ctx.fillText(`📅 日期：${targetConcert.date || '2026'}`, 50, 155);
    ctx.fillText(`📍 地點：${targetConcert.country} · ${targetConcert.venue}`, 50, 190);
    ctx.fillText(`🎯 原定預算：NT$ ${targetConcert.budgetPlan.total.toLocaleString()}`, 50, 225);
    ctx.fillText(`💸 實際旅程花費：NT$ ${targetConcert.ticketStub.actualSpend.toLocaleString()}`, 50, 260);

    ctx.fillStyle = '#D9386A';
    ctx.font = 'italic 15px sans-serif';
    ctx.fillText(`「${targetConcert.ticketStub.memo.substring(0, 42)}」`, 50, 310);

    ctx.fillStyle = '#FF5C8A';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('STAR WALK', 590, 80);
    ctx.fillStyle = '#4A3728';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('演唱會特等紀念票根', 590, 115);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#8C7365';
    ctx.fillText('PASS CODE: OK-STAR-2026', 590, 155);
    ctx.fillText(`完成日期：${targetConcert.completedAt || '2026'}`, 590, 185);

    const link = document.createElement('a');
    link.download = `TicketStub_${targetConcert.artist}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const yearInReview = useMemo(() => {
    const idolTxs = transactions.filter(t => t.categoryGroup === 'idol' && t.type === 'expense');
    const totalIdolSpend = idolTxs.reduce((sum, t) => sum + t.amount, 0);

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
      {/* Header Banner */}
      <div className="sketch-card bg-[#F2EAFF] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div
          className="washi-tape-lilac absolute -top-3 left-10 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />
        <div className="flex items-center gap-3.5">
          <HandDrawnSticker sticker="ticket" size={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#4A3728]">
              🎟️ 星途回憶館｜演唱會票根與年度回顧
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#8C7365]">
              珍藏親自抵達現場的榮耀紀念票根，依據真實數據生成的追星足跡手貼簿！
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Stubs Section */}
      <div className="sketch-card bg-white p-6 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-[#E6D7C3]">
          <div>
            <h4 className="text-base font-black text-[#4A3728] flex items-center gap-2">
              🎫 演唱會紀念票根收藏箱
            </h4>
            <p className="text-xs font-bold text-[#8C7365] mt-0.5">
              已確認完成參加的演唱會方可生成紀念票根
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {concerts
              .filter(c => c.status !== 'completed')
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => handleOpenCompleteModal(c)}
                  className="sticker-btn px-3 py-1.5 text-xs font-black text-[#4A3728] bg-[#FFE3EC] rounded-full"
                >
                  ✓ 確認參加【{c.artist}】生成票根
                </button>
              ))}
          </div>
        </div>

        {activeConcert && activeConcert.ticketStub ? (
          <div className="mt-6 flex flex-col items-center">
            <div
              ref={ticketRef}
              className="w-full max-w-2xl rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFEBF2] via-[#FFFDF7] to-[#F2EAFF] border-4 border-[#4A3728] shadow-[6px_6px_0px_#4A3728] relative p-6 sm:p-8"
            >
              <div className="w-8 h-8 rounded-full bg-[#FFFDF7] border-2 border-[#4A3728] absolute -left-4 top-1/2 -translate-y-1/2" />
              <div className="w-8 h-8 rounded-full bg-[#FFFDF7] border-2 border-[#4A3728] absolute -right-4 top-1/2 -translate-y-1/2" />

              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#FF5C8A] text-white border-2 border-[#4A3728]">
                      CONCERT PASS
                    </span>
                    <span className="text-xs font-black text-[#8A5CF5]">
                      {activeConcert.artist}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#4A3728] tracking-tight leading-tight">
                    {activeConcert.title}
                  </h3>

                  <div className="space-y-1 text-xs font-bold text-[#8C7365] pt-1">
                    <div>📅 活動日期：{activeConcert.date || '2026 年度場次'}</div>
                    <div>📍 場館：{activeConcert.country} · {activeConcert.venue}</div>
                    <div className="flex gap-4 pt-1 font-mono-num">
                      <span>預算：NT$ {activeConcert.budgetPlan.total.toLocaleString()}</span>
                      <span className="text-[#FF3B75] font-black">
                        實際花費：NT$ {activeConcert.ticketStub.actualSpend.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border-2 border-[#4A3728] text-xs font-bold italic text-[#4A3728] shadow-xs mt-3">
                    「{activeConcert.ticketStub.memo}」
                  </div>
                </div>

                <div className="w-full sm:w-44 shrink-0 flex flex-col items-center justify-between border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-[#4A3728] pt-4 sm:pt-0 sm:pl-6">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] bg-slate-900">
                    <img
                      src={activeConcert.ticketStub.photoUrl || activeConcert.coverImage}
                      alt={activeConcert.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-3 text-center space-y-1">
                    <div className="text-[10px] text-[#8C7365] font-mono-num font-bold">
                      STAR-WALK-PASS
                    </div>
                    <div className="text-xs font-black text-[#1E9E73]">
                      已確認到場 🌟
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownloadTicket}
                className="sticker-btn px-5 py-2.5 rounded-full bg-[#FF5C8A] text-white text-xs font-black flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>下載紀念票根圖片 (PNG)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-bold text-[#8C7365]">
            目前尚無已完成的演唱會紀念票根，當你真正參加完演唱會後，點擊上方按鈕生成專屬紀念卡片！
          </div>
        )}
      </div>

      {/* 2026 Idol Year in Review */}
      <div className="sketch-card bg-[#FFFDF7] p-6 md:p-8 relative">
        <div
          className="washi-tape-yellow absolute -top-3 left-12 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />

        <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#E6D7C3]">
          <div>
            <span className="text-xs font-black text-[#8A5CF5]">
              ANNUAL RECAP 2026
            </span>
            <h3 className="text-lg font-black text-[#4A3728] mt-0.5">
              🌟 追星年度足跡手貼簿
            </h3>
          </div>
          <span className="text-xs font-bold text-[#8C7365]">真實資料統計</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-[#FFEBF2] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">最常追的偶像團體</div>
            <div className="text-base font-black text-[#FF5C8A] mt-1 truncate">
              {yearInReview.topGroup}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F2EAFF] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">追星總支出</div>
            <div className="text-base font-black font-mono-num text-[#8A5CF5] mt-1">
              NT$ {yearInReview.totalIdolSpend.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF5D6] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">最大支出類別</div>
            <div className="text-base font-black text-[#4A3728] mt-1 truncate">
              {yearInReview.topCategory}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#E6FAF2] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">累積周邊收藏品</div>
            <div className="text-base font-black font-mono-num text-[#2BB58A] mt-1">
              {yearInReview.collectiblesCount} 件
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">參加演唱會場次</div>
            <div className="text-base font-black font-mono-num text-[#4A3728] mt-1">
              {yearInReview.concertsAttendedCount} 場
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <div className="text-[11px] font-black text-[#8C7365]">建立追星目標數</div>
            <div className="text-base font-black font-mono-num text-[#4A3728] mt-1">
              {yearInReview.goalsCount} 個
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#E4FBF0] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] col-span-2">
            <div className="text-[11px] font-black text-[#8C7365]">達成成就總數</div>
            <div className="text-base font-black font-mono-num text-[#1E9E73] mt-1">
              {yearInReview.unlockedAchievementsCount} 項榮譽解鎖
            </div>
          </div>
        </div>
      </div>

      {/* Complete Concert & Generate Stub Modal */}
      {isStubModalOpen && targetConcertForStub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs">
          <div className="sketch-card relative w-full max-w-md bg-[#FFFDF7] p-6 animate-stamp space-y-4">
            <h3 className="text-base font-black text-[#4A3728] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF5C8A]" />
              <span>確認實際參加演唱會並產生紀念票根</span>
            </h3>
            <p className="text-xs font-bold text-[#8C7365]">
              演唱會：{targetConcertForStub.title}
            </p>

            <form onSubmit={handleGenerateStub} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-[#4A3728] mb-1">
                  實際旅程總花費 (NT$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualSpendStr}
                  onChange={e => setActualSpendStr(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#4A3728] bg-white font-mono-num text-base font-bold text-[#FF5C8A]"
                />
              </div>

              <div>
                <label className="block text-[#4A3728] mb-1">
                  現場感動紀念文字
                </label>
                <textarea
                  value={memoText}
                  onChange={e => setMemoText(e.target.value)}
                  placeholder="寫下一句留在心底的話..."
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white text-xs"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStubModalOpen(false)}
                  className="sticker-btn-soft flex-1 py-2 text-xs font-black bg-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sticker-btn flex-1 py-2 text-xs font-black text-white bg-[#FF5C8A]"
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
