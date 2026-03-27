/**
 * Application Bootstrap Module
 * 
 * Initializes all modules, wires event handlers, and sets up the
 * application lifecycle. This is the main entry point after all
 * modules are loaded.
 * 
 * @module app
 */

const App = (function () {
    'use strict';

    let _initialized = false;
    let _timer = null;
    let _quizEngine = null;

    /**
     * Global event handler for quiz completion
     * Called by QuizEngine when a session finishes
     */
    async function _onQuizComplete(session, timedOut, elapsed) {
        const allSessions = await window.dbGetAll();
        _renderResults(session, allSessions, timedOut, elapsed);
        if (UI) UI.showScreen('resultsScreen');
    }

    /**
     * Render results screen (moved from main HTML)
     */
    function _renderResults(session, allSessions, timedOut, elapsed) {
        const { topicId, topicTitle, totalScore, scoreBreakdown, scoreMeta, passed, tagStats, answers } = session;
        const meta = scoreMeta || { mcqMax: 600, ddMax: 300, csMax: 100 };

        const resTopic = document.getElementById('resTopic');
        if (resTopic) resTopic.textContent = topicTitle;

        const scoreCircle = document.getElementById('scoreCircle');
        const scoreColor = passed ? 'var(--correct)' : totalScore > 500 ? 'var(--warn)' : 'var(--wrong)';
        if (scoreCircle) scoreCircle.style.borderColor = scoreColor;

        const scNum = document.getElementById('scNum');
        if (scNum) {
            scNum.textContent = totalScore;
            scNum.style.color = scoreColor;
        }

        let grade = '';
        if (totalScore >= 900) grade = 'Distinction';
        else if (totalScore >= 700) grade = 'Pass';
        else if (totalScore >= 500) grade = 'Close';
        else grade = 'Fail';

        const scGrade = document.getElementById('scGrade');
        if (scGrade) {
            scGrade.textContent = grade;
            scGrade.style.color = scoreColor;
        }

        const passBadge = document.getElementById('passBadge');
        if (passBadge) {
            passBadge.textContent = passed ? `✓ PASS — ${totalScore}/1000` : `✗ FAIL — ${totalScore}/1000`;
            passBadge.className = `pass-badge ${passed ? 'pass' : 'fail'}`;
        }

        let heading, msg;
        if (passed && totalScore >= 900) {
            heading = 'Outstanding!';
            msg = 'Near-perfect score. You are exam-ready.';
        } else if (passed) {
            heading = 'Well Done!';
            msg = `You passed with ${totalScore}/1000. Review weak areas to push for a distinction.`;
        } else if (totalScore >= 600) {
            heading = 'So Close!';
            msg = `${window.CONFIG.PASSING_SCORE - totalScore} points short. Focus on the weak areas below and try again.`;
        } else {
            heading = 'Keep Studying';
            msg = 'Use the weak area analysis and Microsoft Docs links below to fill the gaps.';
        }

        const resHeading = document.getElementById('resHeading');
        if (resHeading) resHeading.textContent = heading;
        const resMsg = document.getElementById('resMsg');
        if (resMsg) resMsg.textContent = msg;

        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        const resTimeTaken = document.getElementById('resTimeTaken');
        if (resTimeTaken) {
            resTimeTaken.textContent = timedOut ? '⏱ Session ended — time expired' : `⏱ Completed in ${mins}m ${secs}s`;
        }

        const bdMcq = document.getElementById('bdMcq');
        if (bdMcq) bdMcq.textContent = `${Math.round(scoreBreakdown.mcq)}/${Math.round(meta.mcqMax)}`;
        const bdDd = document.getElementById('bdDd');
        if (bdDd) bdDd.textContent = `${Math.round(scoreBreakdown.dragdrop)}/${Math.round(meta.ddMax)}`;
        const bdCs = document.getElementById('bdCs');
        if (bdCs) bdCs.textContent = `${Math.round(scoreBreakdown.casestudy)}/${Math.round(meta.csMax)}`;

        // Confidence interval calculation
        const ts = allSessions.filter(s => s.topicId === topicId);
        const cumPass = ts.filter(s => s.passed).length;
        const ci = window.wilsonCI ? window.wilsonCI(cumPass, ts.length) : { low: 0, mid: 0.5, high: 1 };

        const ciRange = document.getElementById('ciRange');
        if (ciRange) {
            ciRange.style.left = window.pct ? window.pct(ci.low) : `${ci.low * 100}%`;
            ciRange.style.width = window.pct ? window.pct(ci.high - ci.low) : `${(ci.high - ci.low) * 100}%`;
        }
        const ciPoint = document.getElementById('ciPoint');
        if (ciPoint) ciPoint.style.left = window.pct ? window.pct(ci.mid) : `${ci.mid * 100}%`;

        const ciLow = document.getElementById('ciLow');
        if (ciLow) ciLow.textContent = window.pct ? window.pct(ci.low) : `${Math.round(ci.low * 100)}%`;
        const ciMid = document.getElementById('ciMid');
        if (ciMid) ciMid.textContent = window.pct ? window.pct(ci.mid) : `${Math.round(ci.mid * 100)}%`;
        const ciHigh = document.getElementById('ciHigh');
        if (ciHigh) ciHigh.textContent = window.pct ? window.pct(ci.high) : `${Math.round(ci.high * 100)}%`;

        const ciInterpret = document.getElementById('ciInterpret');
        if (ciInterpret) {
            ciInterpret.innerHTML = `Based on <strong>${ts.length} session${ts.length > 1 ? 's' : ''}</strong>, we are 95% confident your pass rate for this topic is between <strong style="color:var(--wrong)">${window.pct ? window.pct(ci.low) : `${Math.round(ci.low * 100)}%`}</strong> and <strong style="color:var(--correct)">${window.pct ? window.pct(ci.high) : `${Math.round(ci.high * 100)}%`}</strong>.`;
        }

        // Performance summary
        const perfGrid = document.getElementById('perfGrid');
        if (perfGrid) {
            perfGrid.innerHTML = '<div class="perf-item"><div class="perf-icon">📊</div><div><div class="perf-area">Building your profile</div><div class="perf-why">Complete more sessions to generate personalised weak-area analysis.</div></div></div>';
        }

        // Review list
        const reviewList = document.getElementById('reviewList');
        if (reviewList) {
            reviewList.innerHTML = answers.map((a, i) => `
                <div class="review-item">
                    <div class="ri-icon">${a && a.fullCredit ? '✅' : a && a.partialCredit ? '⚡' : a && a.skipped ? '⏭' : '❌'}</div>
                    <div class="ri-q">
                        <strong>${a.q || 'Question ' + (i + 1)}</strong>
                        <span style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">${a.type}</span>
                        ${a && !a.fullCredit && !a.skipped && a.correctAnswer ? `<div class="ri-ans">✓ ${a.correctAnswer}</div>` : ''}
                        <div style="font-size:10px;color:${a && a.fullCredit ? 'var(--correct)' : a && a.partialCredit ? 'var(--warn)' : 'var(--wrong)'}">+${Math.round(a && a.pts || 0)} pts</div>
                    </div>
                </div>`).join('');
            reviewList.classList.remove('open');
        }
    }

    /**
     * Show history screen with all sessions
     */
    async function _showHistory() {
        const sessions = await window.dbGetAll();
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;

        if (!sessions.length) {
            historyContent.innerHTML = `<div class="history-empty"><span>📋</span>No sessions yet. Complete a session to see it here.</div>`;
            if (UI) UI.showScreen('historyScreen');
            return;
        }

        const cards = [...sessions].reverse().map(s => {
            const d = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            if (s.type === 'voice_interview') {
                const avg = s.avgScore || 0;
                const band = avg >= 4.5 ? 'OUTSTANDING' : avg >= 3.5 ? 'STRONG' : avg >= 2.5 ? 'COMPETENT' : avg >= 1.5 ? 'DEVELOPING' : 'NEEDS WORK';
                const c = avg >= 4 ? 'var(--correct)' : avg >= 2.5 ? 'var(--warn)' : 'var(--wrong)';
                const dur = s.elapsedSecs ? `${Math.floor(s.elapsedSecs / 60)}m ${s.elapsedSecs % 60}s` : '';
                return `<div class="session-card">
                    <div style="cursor:pointer;flex:1" onclick="App.openVoiceReview(${s.id})">
                        <div class="sc-topic">🎙️ ${UI.escapeHtml(s.topicTitle || 'Voice Interview')}</div>
                        <div class="sc-meta">${d} · ${UI.escapeHtml(s.candidateName || '')} · ${s.questionCount || 0} questions${dur ? ' · ' + dur : ''}</div>
                        <div style="font-size:10px;color:var(--accent2);margin-top:4px">Click to review →</div>
                    </div>
                    <div class="sc-score-block">
                        <div class="sc-score" style="color:${c}">${avg.toFixed(1)}</div>
                        <span class="sc-pct" style="color:${c}">${band}</span>
                    </div>
                </div>`;
            }

            const c = s.passed ? 'var(--correct)' : s.totalScore >= 600 ? 'var(--warn)' : 'var(--wrong)';
            const answered = (s.answers || []).filter(a => a && !a.skipped).length;
            const correct = (s.answers || []).filter(a => a && a.fullCredit).length;
            return `<div class="session-card">
                <div style="cursor:pointer;flex:1" onclick="App.openReplay(${s.id})">
                    <div class="sc-topic">${UI.escapeHtml(s.topicTitle || 'Quiz')}</div>
                    <div class="sc-meta">${d}${s.timedOut ? ' · ⏱ Timed out' : ''} · ${correct}/${answered} correct</div>
                    <div style="font-size:10px;color:var(--accent);margin-top:4px">Click to review →</div>
                </div>
                <div class="sc-score-block">
                    <div class="sc-score" style="color:${c}">${s.totalScore}</div>
                    <span class="sc-pct" style="color:${c}">${s.passed ? 'PASS' : 'FAIL'}</span>
                </div>
            </div>`;
        }).join('');

        historyContent.innerHTML = `<div class="session-list">${cards}</div>
            <div style="margin-top:20px">
                <button class="btn-ghost" style="font-size:10px;padding:10px 20px;color:var(--wrong);border-color:rgba(255,77,109,0.3)"
                    onclick="if(confirm('Clear ALL history? This cannot be undone.')){window.dbClearAll().then(()=>{App.showHistory();window.renderHome();})}">
                    💀 Clear All History
                </button>
            </div>`;

        if (UI) UI.showScreen('historyScreen');
    }

    /**
     * Open replay for a quiz session
     */
    async function _openReplay(sessionId) {
        const session = await window.dbGetById(sessionId);
        if (!session) {
            if (UI) UI.showToast('Session not found.', 'error');
            return;
        }

        // Store replay state globally
        window._replayState = { session: session, current: 0 };
        _renderReplayQuestion();
        if (UI) UI.showScreen('replayScreen');
    }

    /**
     * Render replay question (from history)
     */
    function _renderReplayQuestion() {
        if (!window._replayState) return;

        const { session, current } = window._replayState;
        const questions = session.answers;
        const total = questions.length;
        const ans = questions[current];

        const rpCounter = document.getElementById('rpCounter');
        if (rpCounter) rpCounter.textContent = `${current + 1} / ${total}`;

        const typeLabels = { mcq: 'MCQ', dragdrop: 'Drag & Drop', casestudy: 'Case Study' };
        const typeClasses = { mcq: 'qtb-mcq', dragdrop: 'qtb-dragdrop', casestudy: 'qtb-casestudy' };
        const rpTypeBadge = document.getElementById('rpTypeBadge');
        if (rpTypeBadge) {
            rpTypeBadge.textContent = typeLabels[ans.type] || ans.type;
            rpTypeBadge.className = `q-type-badge ${typeClasses[ans.type] || 'qtb-mcq'}`;
        }

        const rpNav = document.getElementById('rpNav');
        if (rpNav) {
            rpNav.innerHTML = questions.map((a, i) => {
                let cls = 'rq-dot';
                if (i === current) cls += ' rq-current';
                else if (a.skipped) cls += ' rq-skipped';
                else if (a.fullCredit) cls += ' rq-correct';
                else if (a.partialCredit) cls += ' rq-partial';
                else cls += ' rq-wrong';
                return `<div class="${cls}" onclick="App.rpJump(${i})" title="Q${i + 1}">${i + 1}</div>`;
            }).join('');
        }

        const rpQuestionBlock = document.getElementById('rpQuestionBlock');
        if (!rpQuestionBlock) return;

        const letters = ['A', 'B', 'C', 'D', 'E'];

        if (ans.type === 'dragdrop') {
            rpQuestionBlock.innerHTML = `
                <div class="q-block">
                    <div class="q-meta-row"><div class="pts-chip">+${Math.round(ans.pts || 0)} pts earned</div></div>
                    <div class="question-text">${ans.q || 'Drag & Drop question'}</div>
                    <div style="font-size:11px;color:var(--muted2);margin-bottom:12px">Your placements vs correct answers:</div>
                    <div style="display:grid;gap:6px">
                        ${Object.entries(ans.correctMapping || {}).map(([item, correctZone]) => {
                const yourZone = (ans.placements || {})[item];
                const ok = yourZone === correctZone;
                return `<div style="display:flex;gap:10px;align-items:center;padding:9px 14px;background:var(--surface);border:1px solid ${ok ? 'var(--correct)' : 'var(--wrong)'}">
                                <span style="font-size:13px">${ok ? '✅' : '❌'}</span>
                                <span style="flex:1;font-size:12px">${item}</span>
                                <span style="font-size:11px;color:var(--muted)">You: </span>
                                <span style="font-size:11px;color:${ok ? 'var(--correct)' : 'var(--wrong)'}">${yourZone || 'Not placed'}</span>
                                ${!ok ? `<span style="font-size:11px;color:var(--muted)">→ Correct: </span><span style="font-size:11px;color:var(--correct)">${correctZone}</span>` : ''}
                            </div>`;
            }).join('')}
                    </div>
                </div>`;
        } else {
            const opts = (ans.options || []).map((opt, i) => {
                const isCorrect = i === ans.answer;
                const wasSelected = i === ans.selected;
                let cls = 'replay-opt';
                if (isCorrect) cls += ' ro-correct';
                else if (wasSelected && !isCorrect) cls += ' ro-wrong';
                else cls += ' ro-neutral';
                return `<div class="${cls}">
                    <span class="opt-letter">${letters[i]}</span>
                    <span>${opt}</span>
                    ${isCorrect ? `<span style="margin-left:auto;font-size:10px;color:var(--correct)">✓ Correct</span>` : ''}
                    ${wasSelected && !isCorrect ? `<span style="margin-left:auto;font-size:10px;color:var(--wrong)">✗ Your answer</span>` : ''}
                </div>`;
            }).join('');

            const csHeader = ans.type === 'casestudy' ? `
                <div class="cs-sub-header" style="margin-bottom:12px">
                    <div class="cs-sub-label">Case Study — Sub-question ${(ans.csSubIdx || 0) + 1}</div>
                </div>` : '';

            rpQuestionBlock.innerHTML = `
                <div class="q-block">
                    ${csHeader}
                    <div class="q-meta-row">
                        ${(ans.tags || []).slice(0, 2).map(t => `<div class="q-tag-chip">${t}</div>`).join('')}
                        <div class="pts-chip">+${Math.round(ans.pts || 0)} pts earned</div>
                    </div>
                    <div class="question-text">${ans.q || 'Question'}</div>
                    <div style="margin-bottom:16px">${opts}</div>
                </div>`;
        }

        const status = ans.skipped ? 'skipped' : ans.fullCredit ? 'correct' : ans.partialCredit ? 'partial' : 'wrong';
        const statusMap = { correct: 'fp-correct', wrong: 'fp-wrong', partial: 'fp-partial', skipped: 'fp-wrong' };
        const labelMap = { correct: '✓ Correct', wrong: '✗ Incorrect', partial: '◑ Partial Credit', skipped: '⏭ Skipped' };
        const labelClsMap = { correct: 'c', wrong: 'w', partial: 'p', skipped: 'w' };

        const rpFeedback = document.getElementById('rpFeedback');
        if (rpFeedback) {
            rpFeedback.className = `feedback-panel show ${statusMap[status] || 'fp-wrong'}`;
        }

        const rpFbLabel = document.getElementById('rpFbLabel');
        if (rpFbLabel) {
            rpFbLabel.className = `fb-label ${labelClsMap[status] || 'w'}`;
            rpFbLabel.textContent = labelMap[status] || '';
        }

        const rpFbBody = document.getElementById('rpFbBody');
        if (rpFbBody) rpFbBody.innerHTML = ans.explanation || 'No explanation recorded.';

        const rpFbPts = document.getElementById('rpFbPts');
        if (rpFbPts) {
            const color = status === 'correct' ? 'var(--correct)' : status === 'partial' ? 'var(--warn)' : 'var(--wrong)';
            rpFbPts.innerHTML = `<span style="color:${color}">+${Math.round(ans.pts || 0)} pts</span>`;
        }

        const msRef = ans.msRef;
        const rpMsRef = document.getElementById('rpMsRef');
        if (rpMsRef && msRef && msRef.url) {
            rpMsRef.href = msRef.url;
            rpMsRef.style.display = 'inline-flex';
            const rpMsRefLabel = document.getElementById('rpMsRefLabel');
            if (rpMsRefLabel) rpMsRefLabel.textContent = msRef.label || 'Microsoft Docs';
        } else if (rpMsRef) {
            rpMsRef.style.display = 'none';
        }

        const rpPrev = document.getElementById('rpPrev');
        const rpNext = document.getElementById('rpNext');
        if (rpPrev) rpPrev.disabled = current === 0;
        if (rpNext) {
            rpNext.disabled = current === total - 1;
            rpNext.textContent = current === total - 1 ? 'Done' : 'Next →';
        }
    }

    // ── SVG icons for group tiles ────────────────────────────────
    const _GROUP_SVGS = {
        'cs-app': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
            <path d="M25 58 A30 30 0 0 1 85 58" stroke="#1D9E75" stroke-width="1.8" stroke-linecap="round"/>
            <rect x="17" y="56" width="15" height="22" rx="5" stroke="#1D9E75" stroke-width="1.6"/>
            <rect x="21" y="60" width="7" height="14" rx="2" stroke="#0F6E56" stroke-width="1"/>
            <rect x="78" y="56" width="15" height="22" rx="5" stroke="#1D9E75" stroke-width="1.6"/>
            <rect x="82" y="60" width="7" height="14" rx="2" stroke="#0F6E56" stroke-width="1"/>
            <path d="M93 68 Q103 76 99 88" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="94" y="86" width="10" height="6" rx="3" stroke="#1D9E75" stroke-width="1.4"/>
            <path d="M107 84 Q111 88 107 92" stroke="#0F6E56" stroke-width="1.2" stroke-linecap="round" opacity="0.8"/>
            <path d="M111 81 Q117 88 111 95" stroke="#0F6E56" stroke-width="1" stroke-linecap="round" opacity="0.45"/>
            <circle cx="55" cy="30" r="2" fill="#1D9E75" opacity="0.7"/>
            <circle cx="55" cy="36" r="1.2" fill="#1D9E75" opacity="0.35"/>
            <line x1="20" y1="95" x2="90" y2="95" stroke="#1D9E75" stroke-width="0.5" opacity="0.18"/>
        </svg>`,
        'solution-architect': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
            <g opacity="0.10" stroke="#378ADD" stroke-width="0.8">
                <line x1="10" y1="20" x2="100" y2="20"/><line x1="10" y1="38" x2="100" y2="38"/>
                <line x1="10" y1="56" x2="100" y2="56"/><line x1="10" y1="74" x2="100" y2="74"/>
                <line x1="10" y1="92" x2="100" y2="92"/><line x1="20" y1="10" x2="20" y2="100"/>
                <line x1="38" y1="10" x2="38" y2="100"/><line x1="56" y1="10" x2="56" y2="100"/>
                <line x1="74" y1="10" x2="74" y2="100"/><line x1="92" y1="10" x2="92" y2="100"/>
            </g>
            <polygon points="55,14 96,55 55,96 14,55" stroke="#378ADD" stroke-width="1.8" stroke-linejoin="round"/>
            <polygon points="55,30 80,55 55,80 30,55" stroke="#378ADD" stroke-width="1.2" stroke-linejoin="round" opacity="0.65"/>
            <polygon points="55,42 68,55 55,68 42,55" stroke="#378ADD" stroke-width="1" stroke-linejoin="round" opacity="0.4"/>
            <line x1="55" y1="14" x2="55" y2="30" stroke="#378ADD" stroke-width="0.8" opacity="0.6"/>
            <line x1="96" y1="55" x2="80" y2="55" stroke="#378ADD" stroke-width="0.8" opacity="0.6"/>
            <line x1="55" y1="96" x2="55" y2="80" stroke="#378ADD" stroke-width="0.8" opacity="0.6"/>
            <line x1="14" y1="55" x2="30" y2="55" stroke="#378ADD" stroke-width="0.8" opacity="0.6"/>
            <circle cx="55" cy="55" r="3" stroke="#378ADD" stroke-width="1.2"/>
        </svg>`,
        'pp-developer': `<svg width="100" height="100" viewBox="0 0 110 110" fill="none">
            <line x1="8" y1="55" x2="102" y2="55" stroke="#7F77DD" stroke-width="1.4" stroke-linecap="round"/>
            <line x1="55" y1="8" x2="55" y2="102" stroke="#7F77DD" stroke-width="1.4" stroke-linecap="round"/>
            <polyline points="28,55 28,30 40,30" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="82,55 82,30 70,30" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="28,55 28,80 40,80" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="82,55 82,80 70,80" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="55,28 35,28" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round"/>
            <polyline points="55,82 35,82" stroke="#7F77DD" stroke-width="1.1" stroke-linecap="round"/>
            <circle cx="40" cy="30" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
            <circle cx="70" cy="30" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
            <circle cx="40" cy="80" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
            <circle cx="70" cy="80" r="3.5" stroke="#7F77DD" stroke-width="1.4"/>
            <circle cx="35" cy="28" r="2.5" stroke="#534AB7" stroke-width="1.2"/>
            <circle cx="35" cy="82" r="2.5" stroke="#534AB7" stroke-width="1.2"/>
            <rect x="40" y="40" width="30" height="30" rx="3" stroke="#7F77DD" stroke-width="1.8"/>
            <line x1="48" y1="40" x2="48" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="55" y1="40" x2="55" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="62" y1="40" x2="62" y2="34" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="48" y1="70" x2="48" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="55" y1="70" x2="55" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="62" y1="70" x2="62" y2="76" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="40" y1="51" x2="34" y2="51" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="40" y1="59" x2="34" y2="59" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="70" y1="51" x2="76" y2="51" stroke="#7F77DD" stroke-width="1.2"/>
            <line x1="70" y1="59" x2="76" y2="59" stroke="#7F77DD" stroke-width="1.2"/>
            <circle cx="55" cy="55" r="4" stroke="#7F77DD" stroke-width="1" opacity="0.5"/>
            <circle cx="55" cy="55" r="1.5" fill="#7F77DD" opacity="0.6"/>
        </svg>`
    };

    // ── Accent colour per group id ───────────────────────────────
    const _GROUP_ACCENTS = {
        'cs-app':             '#1D9E75',
        'solution-architect': '#378ADD',
        'pp-developer':       '#7F77DD'
    };

    /**
     * Build a group tile (SVG icon + label + tooltip).
     */
    function _groupTileHtml(group) {
        const svg     = _GROUP_SVGS[group.id] || '';
        const accent  = _GROUP_ACCENTS[group.id] || 'var(--accent)';
        const count   = (group.subtopics || []).length + (group.subgroups || []).length;
        const tooltip = group.desc || '';
        return `
            <div class="gtile gtile--${group.id}" onclick="window.openGroup('${group.id}')"
                 style="--gtile-accent:${accent}">
                <div class="gtile__icon">${svg}</div>
                <div class="gtile__label">${group.title}</div>
                <div class="gtile__count">${count} topics</div>
                <div class="gtile__tooltip"><strong>${group.title}</strong>${tooltip}</div>
            </div>`;
    }

    /**
     * Build a plain topic tile (used for ungrouped topics and inside subtopic screens).
     */
    function _topicTileHtml(topic, locked, best) {
        const bestHtml = best !== undefined
            ? `<div class="stile__best">Best: ${best}/1000</div>` : '';
        const action   = locked ? "window.openLicenceModal()" : `window.selectTopic('${topic.id}')`;
        return `
            <div class="stile${locked ? ' stile--locked' : ''}" onclick="${action}">
                <div class="stile__title">${topic.title}${locked ? ' <span class="stile__lock">LOCKED</span>' : ''}</div>
                <div class="stile__desc">${topic.desc || ''}</div>
                ${bestHtml}
            </div>`;
    }

    /**
     * Render the home screen topics grid and stats bar.
     */
    async function _renderHome() {
        // ── Stats bar ────────────────────────────────────────────
        const sessions    = await window.dbGetAll();
        const quizSessions = sessions.filter(s => s.type !== 'voice_interview');

        const elSessions  = document.getElementById('gs-sessions');
        const elQuestions = document.getElementById('gs-questions');
        const elAccuracy  = document.getElementById('gs-accuracy');
        const elBest      = document.getElementById('gs-best');

        if (elSessions)  elSessions.textContent  = quizSessions.length;
        if (elQuestions) elQuestions.textContent  = quizSessions.reduce((a, s) => a + (s.questionCount || 0), 0);
        if (elAccuracy)  elAccuracy.textContent   = quizSessions.length
            ? Math.round(quizSessions.reduce((a, s) => a + s.totalScore, 0) / quizSessions.length) : '—';
        if (elBest)      elBest.textContent       = quizSessions.length
            ? Math.max(...quizSessions.map(s => s.totalScore)) : '—';

        // ── Unlock banner ────────────────────────────────────────
        const unlocked = localStorage.getItem('ppma_unlocked') === 'true';
        const banner   = document.getElementById('unlockBanner');
        if (banner) {
            banner.innerHTML = unlocked ? '' : `
                <div class="unlock-banner">
                    <div class="unlock-banner-text">
                        <strong>Locked topics</strong> require a licence key.
                        One-off payment — no subscription.
                    </div>
                    <button class="unlock-btn" onclick="window.openLicenceModal()">Unlock All →</button>
                </div>`;
        }

        // ── Topics grid ──────────────────────────────────────────
        const grid = document.getElementById('topicsGrid');
        if (!grid) return;

        const bestByTopic = {};
        quizSessions.forEach(s => {
            if (!bestByTopic[s.topicId] || s.totalScore > bestByTopic[s.topicId])
                bestByTopic[s.topicId] = s.totalScore;
        });

        // Collect all topic ids that live inside a group or subgroup
        const groupedIds = new Set(
            (window.CONFIG.GROUPS || []).flatMap(g => g.subtopics || [])
        );
        (window.CONFIG.SUBGROUPS || []).forEach(sg =>
            (sg.subtopics || []).forEach(id => groupedIds.add(id))
        );

        let html = '';

        // Group tiles (SVG icons)
        (window.CONFIG.GROUPS || []).forEach(group => {
            html += _groupTileHtml(group);
        });

        // Standalone topic tiles (plain text style)
        (window.CONFIG.TOPICS || []).forEach(topic => {
            if (groupedIds.has(topic.id)) return;
            const locked = topic.locked && !unlocked;
            html += _topicTileHtml(topic, locked, bestByTopic[topic.id]);
        });

        grid.innerHTML = html;
    }

    /**
     * Show the interview simulation screen (pack picker).
     */
    function _showInterviewSim() {
        const container = document.getElementById('interviewSimGrid');
        if (container) {
            const packs = window.CONFIG.INTERVIEW_PACKS || [];
            container.innerHTML = packs.map(pack => `
                <div class="stile" onclick="window.loadInterviewPack('${pack.id}')">
                    <div class="stile__title">${pack.title}</div>
                    <div class="stile__desc">${pack.desc || ''}</div>
                    <div class="stile__cta">Start session →</div>
                </div>`).join('');
        }
        UI.showScreen('interviewSimScreen');
    }

    /**
     * Open a topic group — shows sub-topic picker screen.
     */
    function _openGroup(groupId) {
        const group = (window.CONFIG.GROUPS || []).find(g => g.id === groupId);
        if (!group) return;

        const unlocked = localStorage.getItem('ppma_unlocked') === 'true';

        document.getElementById('subtopicBreadcrumb').textContent = 'Home → ' + group.title;
        document.getElementById('subtopicGroupTitle').textContent = group.title;
        document.getElementById('subtopicGroupDesc').textContent  = group.desc || '';

        const grid = document.getElementById('subtopicGrid');
        if (!grid) return;

        let html = '';

        // Subgroup tiles (text-only, same stile class)
        (group.subgroups || []).forEach(sgId => {
            const sg = (window.CONFIG.SUBGROUPS || []).find(s => s.id === sgId);
            if (!sg) return;
            html += `
                <div class="stile stile--subgroup" onclick="window.openSubGroup('${sg.id}', '${groupId}')">
                    <div class="stile__title">${sg.title}</div>
                    <div class="stile__desc">${sg.desc || ''}</div>
                    <div class="stile__cta">${(sg.subtopics || []).length} topics →</div>
                </div>`;
        });

        // Direct topic tiles
        (group.subtopics || []).forEach(topicId => {
            const topic = (window.CONFIG.TOPICS || []).find(t => t.id === topicId);
            if (!topic) return;
            html += _topicTileHtml(topic, topic.locked && !unlocked, undefined);
        });

        grid.innerHTML = html;
        UI.showScreen('subtopicScreen');
    }

    /**
     * Open a subgroup within a group.
     */
    function _openSubGroup(subGroupId, parentGroupId) {
        const sg     = (window.CONFIG.SUBGROUPS || []).find(s => s.id === subGroupId);
        const parent = (window.CONFIG.GROUPS    || []).find(g => g.id === parentGroupId);
        if (!sg) return;

        const unlocked = localStorage.getItem('ppma_unlocked') === 'true';

        document.getElementById('subtopicBreadcrumb').textContent = 'Home → ' + (parent?.title || '') + ' → ' + sg.title;
        document.getElementById('subtopicGroupTitle').textContent  = sg.title;
        document.getElementById('subtopicGroupDesc').textContent   = sg.desc || '';

        const grid = document.getElementById('subtopicGrid');
        if (!grid) return;

        grid.innerHTML = (sg.subtopics || []).map(topicId => {
            const topic = (window.CONFIG.TOPICS || []).find(t => t.id === topicId);
            if (!topic) return '';
            return _topicTileHtml(topic, topic.locked && !unlocked, undefined);
        }).join('');

        UI.showScreen('subtopicScreen');
    }

    /**
     * Initialize all modules and wire up global functions
     */
    function init() {
        if (_initialized) return;

        // Initialize UI module FIRST
        if (window.UI && window.UI.init) window.UI.init();

        // Initialize Timer
        const timerDisplay = document.getElementById('timerDisplay');
        const timerBarFill = document.getElementById('timerBarFill');
        if (window.Timer) {
            _timer = window.Timer.init({
                displayElement: timerDisplay,
                barFillElement: timerBarFill
            });
        }

        // Initialize QuizEngine
        if (window.QuizEngine) {
            _quizEngine = window.QuizEngine.init(_timer);
        }

        // Initialize Interview module
        if (window.Interview && window.Interview.init) window.Interview.init();

        // ── Wire up global functions BEFORE rendering ──────────
        window.showHome = () => _renderHome().then(() => UI.showScreen('homeScreen'));
        window.showGuided = () => UI.showScreen('guidedScreen');
        window.showHistory = () => _showHistory();
        window.showInterviewSim = () => _showInterviewSim();
        window.openGroup = (groupId) => _openGroup(groupId);
        window.openSubGroup = (sgId, pgId) => _openSubGroup(sgId, pgId);
        window.renderHome = () => _renderHome();
        window.openLicenceModal = () => UI.openModal('licenceModal');
        window.closeLicenceModal = () => UI.closeModal();
        window.handleModalBgClick = (e) => UI.handleModalBgClick(e, 'licenceModal');

        window.selectTopic = (topicId) => {
            if (_quizEngine) _quizEngine.launchFreshTopic(topicId);
        };

        window.openReplay = _openReplay;
        window.rpNavigate = (dir) => {
            if (!window._replayState) return;
            const total = window._replayState.session.answers.length;
            window._replayState.current = Math.max(0, Math.min(total - 1, window._replayState.current + dir));
            _renderReplayQuestion();
            window.scrollTo(0, 0);
        };
        window.rpJump = (idx) => {
            window._replayState.current = idx;
            _renderReplayQuestion();
            window.scrollTo(0, 0);
        };

        window.loadInterviewPack = (packId) => {
            if (window.Interview) window.Interview.loadPack(packId);
        };

        window.onQuizComplete = _onQuizComplete;

        _initialized = true;

        // NOW render home (functions are wired)
        _renderHome();
    }

    // Public API
    return {
        init: init,
        showHistory: _showHistory,
        openReplay: _openReplay,
        openVoiceReview: async (sessionId) => {
            const session = await window.dbGetById(sessionId);
            if (!session) return;
            // Set up interview state for review
            if (window.Interview && window.Interview.getState) {
                const viState = window.Interview.getState();
                viState.pack = { pack_name: session.packName, target_role: session.topicTitle, scoring_model: { rubric: {} } };
                viState.packId = session.packId;
                viState.candidateName = session.candidateName || 'Candidate';
                viState.transcript = session.transcript || [];
                viState.scores = session.scores || [];
                viState.elapsedSecs = session.elapsedSecs || 0;
            }
            // This would need viShowResults to be exposed
            if (window.viShowResults) window.viShowResults(session.avgScore || 0, session);
        },
        rpNavigate: (dir) => window.rpNavigate(dir),
        rpJump: (idx) => window.rpJump(idx)
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
} else {
    window.App = App;
}