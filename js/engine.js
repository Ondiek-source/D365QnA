/**
 * Quiz Engine Module
 * 
 * Core quiz logic: session management, question navigation, scoring,
 * answer processing, and session persistence. Handles all question types
 * (MCQ, True/False, Drag & Drop, Case Study) with balanced question selection.
 * 
 * @module engine
 * @requires Timer (global)
 * @requires window.dbGetAll, dbSave, dbGetDraft, dbSaveDraft, dbClearDraft (from data.js)
 * @requires window.loadQuestions, buildSession (from data.js)
 * @requires window.CONFIG (from config.js)
 */

const QuizEngine = (function() {
    'use strict';
    
    // Private state
    let _state = null;           // Current quiz session state
    let _pendingTopicId = null;  // Topic waiting to be launched
    let _pendingStartFn = null;  // Function to launch pending topic
    
    // DOM element references (lazy-loaded)
    let _dom = {};
    
    // Timer instance (set after init)
    let _timer = null;
    
    /**
     * Get DOM elements (cached after first call)
     */
    function _getDOM() {
        if (Object.keys(_dom).length) return _dom;
        
        _dom = {
            quizScreen: document.getElementById('quizScreen'),
            qCounter: document.getElementById('qCounter'),
            qTypeBadge: document.getElementById('qTypeBadge'),
            liveScore: document.getElementById('liveScore'),
            progressFill: document.getElementById('progressFill'),
            qNav: document.getElementById('qNav'),
            questionBlock: document.getElementById('questionBlock'),
            feedbackPanel: document.getElementById('feedbackPanel'),
            fbLabel: document.getElementById('fbLabel'),
            fbBody: document.getElementById('fbBody'),
            fbPts: document.getElementById('fbPts'),
            msRefBtn: document.getElementById('msRefBtn'),
            msRefLabel: document.getElementById('msRefLabel'),
            btnNext: document.getElementById('btnNext'),
            btnSkip: document.getElementById('btnSkip'),
            flagBtn: document.getElementById('flagBtn'),
            reportBtn: document.getElementById('reportBtn'),
            quizLayout: document.getElementById('quizLayout'),
            scenarioPanel: document.getElementById('scenarioPanel'),
            scenarioBody: document.getElementById('scenarioBody'),
            timerWrap: document.querySelector('.timer-wrap')
        };
        
        return _dom;
    }
    
    /**
     * Show loading overlay
     */
    function _showLoading(show, text = 'Loading questions…') {
        const overlay = document.getElementById('loadingOverlay');
        const textEl = document.getElementById('loadingText');
        if (!overlay) return;
        
        if (textEl) textEl.textContent = text;
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    /**
     * Update live score display
     */
    function _updateScoreDisplay() {
        if (_dom.liveScore) {
            _dom.liveScore.textContent = Math.round(_state.totalScore);
        }
    }
    
    /**
     * Update progress bar based on current question index
     */
    function _updateProgressBar() {
        if (!_dom.progressFill || !_state.questions) return;
        const percent = (_state.current / _state.questions.length) * 100;
        _dom.progressFill.style.width = `${percent}%`;
    }
    
    /**
     * Render navigation dots
     */
    function _renderNavDots() {
        if (!_dom.qNav || !_state.questions) return;
        
        const dots = _state.questions.map((q, i) => {
            const ans = _state.answers[i];
            let cls = 'q-dot';
            
            if (i === _state.current) cls += ' current';
            else if (ans === null) cls += ' skipped';
            else if (ans.skipped) cls += ' skipped';
            else if (ans.fullCredit) cls += ' answered-correct';
            else if (ans.partialCredit) cls += ' answered-partial';
            else cls += ' answered-wrong';
            
            if (_state.flags.has(i)) cls += ' flagged';
            
            return `<div class="${cls}" onclick="QuizEngine.jumpTo(${i})" title="Q${i+1} — ${q.type}">${i+1}</div>`;
        }).join('');
        
        _dom.qNav.innerHTML = dots;
    }
    
    /**
     * Show feedback panel after answer
     */
    function _showFeedback(status, explanation, ptsEarned, ptsMax, msRef) {
        const statusMap = { correct: 'fp-correct', wrong: 'fp-wrong', partial: 'fp-partial' };
        const labelMap = { correct: '✓ Correct', wrong: '✗ Incorrect', partial: '◑ Partial Credit' };
        const labelClsMap = { correct: 'c', wrong: 'w', partial: 'p' };
        
        if (_dom.feedbackPanel) {
            _dom.feedbackPanel.className = `feedback-panel show ${statusMap[status] || 'fp-wrong'}`;
        }
        
        if (_dom.fbLabel) {
            _dom.fbLabel.className = `fb-label ${labelClsMap[status] || 'w'}`;
            _dom.fbLabel.textContent = labelMap[status] || '';
        }
        
        if (_dom.fbBody) {
            _dom.fbBody.innerHTML = explanation || '';
        }
        
        if (_dom.fbPts) {
            const color = status === 'correct' ? 'var(--correct)' : status === 'partial' ? 'var(--warn)' : 'var(--wrong)';
            _dom.fbPts.innerHTML = `<span style="color:${color}">+${Math.round(ptsEarned)} pts</span> <span style="color:var(--muted)">/ ${Math.round(ptsMax)} possible</span>`;
        }
        
        if (msRef && _dom.msRefBtn) {
            _dom.msRefBtn.href = msRef.url;
            _dom.msRefBtn.style.display = 'inline-flex';
            if (_dom.msRefLabel) _dom.msRefLabel.textContent = msRef.label;
        } else if (_dom.msRefBtn) {
            _dom.msRefBtn.style.display = 'none';
        }
    }
    
    /**
     * Save current draft to IndexedDB
     */
    async function _saveDraft() {
        if (!_state || !_state.questions) return;
        
        await window.dbSaveDraft({
            topicId: _state.topicId,
            topicTitle: _state.topicTitle,
            questions: _state.questions,
            scoreMeta: _state.scoreMeta,
            sessionMinutes: _state.sessionMinutes || window.CONFIG.SESSION_MINUTES,
            current: _state.current,
            answers: _state.answers,
            flags: [..._state.flags],
            totalScore: _state.totalScore,
            scoreBreakdown: { ..._state.scoreBreakdown },
            startTime: _state.startTime,
            timerSecs: _state.timerSecs,
            ddPlacements: _state.ddPlacements,
            savedAt: Date.now()
        });
    }
    
    // Public API
    return {
        /**
         * Initialize the quiz engine
         * @param {Object} timerInstance - Timer instance from timer.js
         */
        init: function(timerInstance) {
            _timer = timerInstance;
            _getDOM(); // Cache DOM references
            return this;
        },
        
        /**
         * Launch a fresh quiz session for a topic
         * @param {string} topicId - Topic identifier
         */
        launchFreshTopic: async function(topicId) {
            _showLoading(true);
            
            try {
                const bank = await window.loadQuestions(topicId);
                const topic = window.CONFIG.TOPICS.find(t => t.id === topicId);
                const questions = window.buildSession(bank, topicId);
                const scoreMeta = questions._meta || { mcqMax: 600, ddMax: 300, csMax: 100 };
                
                _state = {
                    topicId: topicId,
                    topicTitle: topic.title,
                    sessionMinutes: window.getSessionMinutes(topicId),
                    questions: questions,
                    scoreMeta: scoreMeta,
                    current: 0,
                    answers: new Array(questions.length).fill(null),
                    flags: new Set(),
                    totalScore: 0,
                    scoreBreakdown: { mcq: 0, dragdrop: 0, casestudy: 0 },
                    startTime: Date.now(),
                    timerSecs: window.getSessionMinutes(topicId) * 60,
                    timerInterval: null,
                    finished: false,
                    dragSource: null,
                    ddPlacements: {}
                };
                
                _showLoading(false);
                
                // Hide timer wrap if no timer (0 minutes means no timer)
                if (_dom.timerWrap) {
                    _dom.timerWrap.style.display = _state.sessionMinutes ? 'flex' : 'none';
                }
                
                // Start timer
                if (_timer && _state.timerSecs > 0) {
                    _timer.start(
                        _state.timerSecs,
                        () => this.finishQuiz(true), // onExpiry
                        null
                    );
                }
                
                this.renderQuestion();
                
                _pendingTopicId = null;
                _pendingStartFn = null;
                
            } catch (e) {
                _showLoading(false);
                if (!e.message.includes('file://') && !e.message.includes('HTTP')) {
                    console.error('Failed to launch quiz:', e);
                }
            }
        },
        
        /**
         * Render the current question
         */
        renderQuestion: function() {
            if (!_state || !_state.questions) return;
            
            const q = _state.questions[_state.current];
            const total = _state.questions.length;
            
            // Update topbar
            if (_dom.qCounter) {
                _dom.qCounter.textContent = `${_state.current + 1} / ${total}`;
            }
            
            const typeLabelMap = { mcq: 'MCQ', tf: 'True / False', dragdrop: 'Drag & Drop', casestudy: 'Case Study' };
            const typeClsMap = { mcq: 'qtb-mcq', tf: 'qtb-mcq', dragdrop: 'qtb-dragdrop', casestudy: 'qtb-casestudy' };
            
            if (_dom.qTypeBadge) {
                _dom.qTypeBadge.textContent = typeLabelMap[q.type] || q.type;
                _dom.qTypeBadge.className = `q-type-badge ${typeClsMap[q.type] || 'qtb-mcq'}`;
            }
            
            _updateScoreDisplay();
            _updateProgressBar();
            
            // Scenario panel visibility
            if (_dom.quizLayout && _dom.scenarioPanel) {
                if (q.type === 'casestudy') {
                    _dom.scenarioPanel.style.display = 'flex';
                    _dom.quizLayout.className = 'quiz-layout has-scenario';
                    this.renderScenarioPanel(q);
                } else {
                    _dom.scenarioPanel.style.display = 'none';
                    _dom.quizLayout.className = 'quiz-layout';
                }
            }
            
            // Flag button state
            if (_dom.flagBtn) {
                _dom.flagBtn.className = `flag-btn${_state.flags.has(_state.current) ? ' flagged' : ''}`;
            }
            
            // Reset report button
            if (_dom.reportBtn) {
                _dom.reportBtn.className = 'report-btn';
            }
            
            // Clear feedback
            if (_dom.feedbackPanel) {
                _dom.feedbackPanel.className = 'feedback-panel';
            }
            if (_dom.msRefBtn) {
                _dom.msRefBtn.style.display = 'none';
            }
            if (_dom.btnNext) {
                _dom.btnNext.className = 'btn-next';
            }
            if (_dom.btnSkip) {
                _dom.btnSkip.className = 'btn-skip';
            }
            
            // Dispatch to specific renderers
            if (q.type === 'mcq' || q.type === 'tf') {
                this.renderMCQ(q);
            } else if (q.type === 'dragdrop') {
                this.renderDragDrop(q);
            } else if (q.type === 'casestudy') {
                this.renderCaseStudy(q);
            }
            
            _renderNavDots();
            
            // Restore prior answer state if jumping back
            const prior = _state.answers[_state.current];
            if (prior && !prior.skipped) {
                this.showAnsweredState(q, prior);
            }
        },
        
        /**
         * Render MCQ/TrueFalse question
         */
        renderMCQ: function(q) {
            const catMap = {
                delegable: ['cat-delegable', '✅ Delegable'],
                nondelegable: ['cat-nondelegable', '❌ Non-Delegable'],
                partial: ['cat-partial', '⚠️ Partial'],
                general: ['cat-general', '📋 General']
            };
            const [cc, cl] = catMap[q.category] || ['cat-general', 'General'];
            const tags = (q.tags || []).slice(0, 2).map(t => `<div class="q-tag-chip">${t}</div>`).join('');
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const opts = q.shuffledOptions || q.options;
            
            if (!_dom.questionBlock) return;
            
            _dom.questionBlock.innerHTML = `
                <div class="q-block">
                    <div class="q-meta-row">
                        <div class="cat-tag ${cc}">${cl}</div>${tags}
                        <div class="pts-chip">+${Math.round(q.pts)} pts</div>
                    </div>
                    <div class="question-text">${q.q}</div>
                    <div class="options-grid">
                        ${opts.map((opt, i) => `
                            <button class="opt-btn" id="opt_${i}" onclick="QuizEngine.selectMCQ(${i})">
                                <div style="display:flex;flex-direction:column;width:100%">
                                    <div style="display:flex;align-items:flex-start;gap:12px">
                                        <span class="opt-letter">${letters[i]}</span>
                                        <span>${opt}</span>
                                    </div>
                                    <div class="opt-wrong-note" id="wn_${i}"></div>
                                </div>
                            </button>`).join('')}
                    </div>
                </div>`;
        },
        
        /**
         * Handle MCQ answer selection
         */
        selectMCQ: function(idx) {
            const q = _state.questions[_state.current];
            if (_state.answers[_state.current] && !_state.answers[_state.current].skipped) return;
            
            const btns = document.querySelectorAll('.opt-btn');
            btns.forEach(b => b.disabled = true);
            
            const correctIdx = q.shuffledAnswer !== undefined ? q.shuffledAnswer : q.answer;
            const correct = idx === correctIdx;
            const pts = correct ? q.pts : 0;
            
            _state.answers[_state.current] = {
                type: q.type === 'tf' ? 'tf' : 'mcq',
                selected: idx,
                correct: correct,
                pts: pts,
                fullCredit: correct,
                partialCredit: false
            };
            
            if (correct) _state.totalScore += pts;
            _state.scoreBreakdown.mcq += pts;
            
            const wrongExp = q.shuffledWrongExplanations || q.wrongExplanations;
            
            btns.forEach((b, i) => {
                if (i === correctIdx) {
                    b.classList.add('correct');
                } else if (i === idx && !correct) {
                    b.classList.add('wrong');
                } else {
                    b.classList.add('incorrect-reveal');
                    if (wrongExp && wrongExp[i]) {
                        const wn = document.getElementById(`wn_${i}`);
                        if (wn) wn.textContent = wrongExp[i];
                    }
                }
            });
            
            _showFeedback(correct ? 'correct' : 'wrong', q.explanation, pts, q.pts, q.msRef);
            
            if (_dom.btnNext) _dom.btnNext.className = 'btn-next show';
            if (_dom.btnSkip) _dom.btnSkip.className = 'btn-skip hide';
            
            _saveDraft();
            _renderNavDots();
            _updateScoreDisplay();
        },
        
        /**
         * Render Drag & Drop question
         */
        renderDragDrop: function(q) {
            const qIdx = _state.current;
            if (!_state.ddPlacements[qIdx]) _state.ddPlacements[qIdx] = {};
            const placements = _state.ddPlacements[qIdx];
            const answered = _state.answers[qIdx] && !_state.answers[qIdx].skipped;
            
            const zonesHtml = q.zones.map(zone => {
                const placed = q.items.filter(item => placements[item] === zone);
                let zCls = 'dd-zone';
                if (answered) {
                    const correct = placed.every(item => q.correctMapping[item] === zone);
                    const allCorrectHere = q.items.filter(item => q.correctMapping[item] === zone).every(item => placements[item] === zone);
                    if (correct && allCorrectHere) zCls += ' zone-correct';
                    else if (!correct) zCls += ' zone-wrong';
                    else zCls += ' zone-partial';
                }
                const zoneKey = zone.replace(/\s+/g, '_');
                return `<div class="${zCls}" id="zone_${zoneKey}"
                    data-zone="${zone.replace(/"/g, '&quot;')}"
                    ondragover="QuizEngine.ddDragOver(event,this)"
                    ondragleave="QuizEngine.ddDragLeave(event,this)"
                    ondrop="QuizEngine.ddDrop(event,this)">
                    <div class="dd-zone-label">${zone}</div>
                    ${placed.map(item => `
                        <div class="dd-placed-item" data-item="${item.replace(/"/g, '&quot;')}" data-zone="${zone.replace(/"/g, '&quot;')}"
                            onclick="${answered ? '' : 'QuizEngine.ddRemoveEl(this)'}">
                            <span>${item}</span>
                            ${answered ? '' : '<span class="remove-x">✕</span>'}
                        </div>`).join('')}
                </div>`;
            }).join('');
            
            const unplacedItems = q.items.filter(item => !placements[item]);
            const poolHtml = unplacedItems.map(item => `
                <div class="dd-item" draggable="${answered ? 'false' : 'true'}" id="dditem_${item.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}"
                    data-item="${item.replace(/"/g, '&quot;')}"
                    ondragstart="QuizEngine.ddDragStart(event,this)"
                    ondragend="QuizEngine.ddDragEnd(event)">
                    <span class="dd-drag-handle">⠿</span>
                    <span>${item}</span>
                </div>`).join('');
            
            const allPlaced = q.items.every(item => placements[item]);
            
            if (!_dom.questionBlock) return;
            
            _dom.questionBlock.innerHTML = `
                <div class="q-block">
                    <div class="q-meta-row">
                        ${(q.tags || []).slice(0, 2).map(t => `<div class="q-tag-chip">${t}</div>`).join('')}
                        <div class="pts-chip">+${Math.round(q.pts)} pts each correct</div>
                    </div>
                    <div class="dd-instruction">${q.instruction}</div>
                    <div class="dd-layout">
                        <div>
                            <div class="dd-items-pool">
                                <div class="dd-pool-label">Items to classify</div>
                                ${poolHtml || '<div style="font-size:11px;color:var(--muted)">All items placed ✓</div>'}
                            </div>
                        </div>
                        <div class="dd-zones">${zonesHtml}</div>
                    </div>
                    ${!answered ? `<button class="dd-check-btn" id="ddCheckBtn" onclick="QuizEngine.checkDragDrop()" ${allPlaced ? '' : 'disabled'}>Check Answer →</button>` : ''}
                </div>`;
        },
        
        /**
         * Handle Drag & Drop answer check
         */
        checkDragDrop: function() {
            const q = _state.questions[_state.current];
            const qIdx = _state.current;
            const placements = _state.ddPlacements[qIdx] || {};
            
            let correctCount = 0;
            q.items.forEach(item => {
                if (placements[item] === q.correctMapping[item]) correctCount++;
            });
            
            const total = q.items.length;
            const ptsActual = correctCount === total ? q.pts : Math.round(q.pts * (correctCount / total));
            
            _state.totalScore += ptsActual;
            _state.scoreBreakdown.dragdrop += ptsActual;
            
            const full = correctCount === total;
            const partial = !full && correctCount > 0;
            
            _state.answers[qIdx] = {
                type: 'dragdrop',
                placements: { ...placements },
                correctCount: correctCount,
                total: total,
                pts: ptsActual,
                fullCredit: full,
                partialCredit: partial
            };
            
            this.renderDragDrop(q);
            
            const status = full ? 'correct' : partial ? 'partial' : 'wrong';
            const msg = full ? q.explanation : `${correctCount}/${total} items correctly placed. ${q.explanation || ''}`;
            _showFeedback(status, msg, ptsActual, q.pts, q.msRef);
            
            if (_dom.btnNext) _dom.btnNext.className = 'btn-next show';
            if (_dom.btnSkip) _dom.btnSkip.className = 'btn-skip hide';
            
            _saveDraft();
            _renderNavDots();
            _updateScoreDisplay();
        },
        
        /**
         * Render Case Study question
         */
        renderCaseStudy: function(q) {
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const opts = q.shuffledOptions || q.options;
            
            if (!_dom.questionBlock) return;
            
            _dom.questionBlock.innerHTML = `
                <div class="q-block">
                    <div class="cs-sub-header">
                        <div class="cs-sub-label">Case Study — Sub-question ${q.csSubIdx + 1} of ${q.csTotalSubs}</div>
                        <div class="cs-sub-progress" style="margin-left:auto;font-size:9px;color:var(--muted)">Scenario in side panel →</div>
                    </div>
                    <div class="q-meta-row">
                        ${(q.tags || []).slice(0, 2).map(t => `<div class="q-tag-chip">${t}</div>`).join('')}
                        <div class="pts-chip">+${Math.round(q.pts)} pts</div>
                    </div>
                    <div class="question-text">${q.q}</div>
                    <div class="options-grid">
                        ${opts.map((opt, i) => `
                            <button class="opt-btn" id="opt_${i}" onclick="QuizEngine.selectCaseStudy(${i})">
                                <div style="display:flex;align-items:flex-start;gap:12px">
                                    <span class="opt-letter">${letters[i]}</span>
                                    <span>${opt}</span>
                                </div>
                            </button>`).join('')}
                    </div>
                </div>`;
        },
        
        /**
         * Handle Case Study answer selection
         */
        selectCaseStudy: function(idx) {
            const q = _state.questions[_state.current];
            if (_state.answers[_state.current] && !_state.answers[_state.current].skipped) return;
            
            const btns = document.querySelectorAll('.opt-btn');
            btns.forEach(b => b.disabled = true);
            
            const correctIdx = q.shuffledAnswer !== undefined ? q.shuffledAnswer : q.answer;
            const correct = idx === correctIdx;
            const pts = correct ? q.pts : 0;
            
            _state.answers[_state.current] = {
                type: 'casestudy',
                selected: idx,
                correct: correct,
                pts: pts,
                fullCredit: correct,
                partialCredit: false
            };
            
            if (correct) _state.totalScore += pts;
            _state.scoreBreakdown.casestudy += pts;
            
            btns.forEach((b, i) => {
                if (i === correctIdx) b.classList.add('correct');
                else if (i === idx && !correct) b.classList.add('wrong');
            });
            
            _showFeedback(correct ? 'correct' : 'wrong', q.explanation, pts, q.pts, q.msRef);
            this.renderScenarioPanel(q);
            
            if (_dom.btnNext) _dom.btnNext.className = 'btn-next show';
            if (_dom.btnSkip) _dom.btnSkip.className = 'btn-skip hide';
            
            _saveDraft();
            _renderNavDots();
            _updateScoreDisplay();
        },
        
        /**
         * Render scenario panel for case study
         */
        renderScenarioPanel: function(q) {
            if (!_dom.scenarioBody) return;
            
            const siblings = _state.questions.filter(x => x.type === 'casestudy' && x.scenarioId === q.scenarioId);
            const subListHtml = siblings.map((sq, si) => {
                const sqIdx = _state.questions.indexOf(sq);
                const ans = _state.answers[sqIdx];
                let cls = 'sq-item';
                if (sqIdx === _state.current) cls += ' sq-current';
                else if (ans && !ans.skipped && ans.fullCredit) cls += ' sq-done-pass';
                else if (ans && !ans.skipped && !ans.fullCredit) cls += ' sq-done-fail';
                return `<div class="${cls}" onclick="QuizEngine.jumpTo(${sqIdx})">
                    <span style="min-width:16px;font-size:10px">${si + 1}.</span>
                    <span>${sq.q.substring(0, 60)}${sq.q.length > 60 ? '…' : ''}</span>
                </div>`;
            }).join('');
            
            _dom.scenarioBody.innerHTML = `
                <span class="scenario-label">📋 ${q.scenarioTitle || 'Scenario'}</span>
                <div>${q.scenarioText}</div>
                <div class="scenario-q-list">
                    <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Sub-Questions</div>
                    ${subListHtml}
                </div>`;
        },
        
        /**
         * Show answered state for a previously answered question
         */
        showAnsweredState: function(q, ans) {
            if ((q.type === 'mcq' || q.type === 'tf') && ans.selected !== undefined) {
                const correctIdx = q.shuffledAnswer !== undefined ? q.shuffledAnswer : q.answer;
                const btns = document.querySelectorAll('.opt-btn');
                btns.forEach(b => b.disabled = true);
                btns.forEach((b, i) => {
                    if (i === correctIdx) b.classList.add('correct');
                    else if (i === ans.selected && !ans.correct) b.classList.add('wrong');
                });
                _showFeedback(ans.correct ? 'correct' : 'wrong', q.explanation, ans.pts, q.pts, q.msRef);
                if (_dom.btnNext) _dom.btnNext.className = 'btn-next show';
                if (_dom.btnSkip) _dom.btnSkip.className = 'btn-skip hide';
            }
        },
        
        /**
         * Jump to a specific question
         */
        jumpTo: function(idx) {
            _state.current = idx;
            this.renderQuestion();
        },
        
        /**
         * Skip current question
         */
        skipQuestion: function() {
            _state.answers[_state.current] = { skipped: true, pts: 0, fullCredit: false, partialCredit: false };
            _saveDraft();
            _renderNavDots();
            this.advanceQuestion();
        },
        
        /**
         * Advance to next unanswered question or finish
         */
        advanceQuestion: function() {
            let next = _state.current + 1;
            if (next >= _state.questions.length) {
                const firstSkipped = _state.answers.findIndex((a, i) => a === null || a.skipped);
                if (firstSkipped >= 0) {
                    _state.current = firstSkipped;
                    this.renderQuestion();
                } else {
                    this.finishQuiz(false);
                }
            } else {
                _state.current = next;
                this.renderQuestion();
            }
        },
        
        /**
         * Finish the quiz and save results
         */
        finishQuiz: async function(timedOut) {
            if (_timer) _timer.stop();
            
            const elapsed = (_state.sessionMinutes || window.CONFIG.SESSION_MINUTES) * 60 - _state.timerSecs;
            const tagStats = {};
            
            _state.questions.forEach((q, i) => {
                const ans = _state.answers[i];
                (q.tags || []).forEach(tag => {
                    if (!tagStats[tag]) tagStats[tag] = { correct: 0, total: 0 };
                    tagStats[tag].total++;
                    if (ans && ans.fullCredit) tagStats[tag].correct++;
                });
            });
            
            const record = {
                topicId: _state.topicId,
                topicTitle: _state.topicTitle,
                totalScore: Math.round(_state.totalScore),
                scoreBreakdown: { ..._state.scoreBreakdown },
                scoreMeta: { ..._state.scoreMeta },
                passed: _state.totalScore >= window.CONFIG.PASSING_SCORE,
                elapsed: elapsed,
                timedOut: timedOut,
                sessionMinutes: _state.sessionMinutes || window.CONFIG.SESSION_MINUTES,
                questionCount: _state.questions.length,
                date: new Date().toISOString(),
                tagStats: tagStats,
                answers: _state.answers.map((a, i) => {
                    const q = _state.questions[i];
                    return {
                        ...a,
                        q: q.q || q.instruction || '',
                        type: q.type,
                        tags: q.tags || [],
                        options: q.shuffledOptions || q.options || [],
                        answer: q.shuffledAnswer !== undefined ? q.shuffledAnswer : q.answer,
                        explanation: q.explanation || '',
                        msRef: q.msRef || null,
                        correctAnswer: q.type !== 'dragdrop' ? ((q.shuffledOptions || q.options)?.[(q.shuffledAnswer !== undefined ? q.shuffledAnswer : q.answer)] || '') : 'See mapping',
                        correctMapping: q.correctMapping || null,
                        zones: q.zones || null,
                        items: q.items || null,
                        csSubIdx: q.csSubIdx,
                        scenarioTitle: q.scenarioTitle || null
                    };
                })
            };
            
            await window.dbSave(record);
            await window.dbClearDraft(_state.topicId);
            
            // Trigger results rendering (handled by app.js)
            if (window.onQuizComplete) {
                window.onQuizComplete(record, timedOut, elapsed);
            }
        },
        
        /**
         * Get current quiz state
         */
        getState: function() {
            return _state;
        },
        
        /**
         * Check if there's a pending topic with draft
         */
        hasDraftForTopic: async function(topicId) {
            const draft = await window.dbGetDraft(topicId);
            return draft && draft.timerSecs > 0;
        },
        
        /**
         * Resume a draft session
         */
        resumeDraft: async function(draft) {
            if (!draft) return false;
            
            _state = {
                topicId: draft.topicId,
                topicTitle: draft.topicTitle,
                sessionMinutes: draft.sessionMinutes || window.getSessionMinutes(draft.topicId),
                questions: draft.questions,
                scoreMeta: draft.scoreMeta || { mcqMax: 600, ddMax: 300, csMax: 100 },
                current: draft.current,
                answers: draft.answers,
                flags: new Set(draft.flags || []),
                totalScore: draft.totalScore,
                scoreBreakdown: draft.scoreBreakdown,
                startTime: draft.startTime,
                timerSecs: draft.timerSecs,
                timerInterval: null,
                finished: false,
                dragSource: null,
                ddPlacements: draft.ddPlacements || {}
            };
            
            if (_dom.timerWrap) {
                _dom.timerWrap.style.display = _state.sessionMinutes ? 'flex' : 'none';
            }
            
            if (_timer && _state.timerSecs > 0) {
                _timer.restore(_state.timerSecs, _state.sessionMinutes * 60);
                _timer.start(_state.timerSecs, () => this.finishQuiz(true), null);
            }
            
            this.renderQuestion();
            return true;
        },
        
        // Drag & Drop event handlers
        ddDragStart: function(e, el) {
            const item = el.dataset.item;
            _state.dragSource = item;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item);
        },
        
        ddDragEnd: function(e) {
            e.target.classList.remove('dragging');
            _state.dragSource = null;
        },
        
        ddDragOver: function(e, el) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            el.classList.add('drag-over');
        },
        
        ddDragLeave: function(e, el) {
            el.classList.remove('drag-over');
        },
        
        ddDrop: function(e, el) {
            e.preventDefault();
            el.classList.remove('drag-over');
            const zone = el.dataset.zone;
            const item = e.dataTransfer.getData('text/plain') || _state.dragSource;
            if (!item || !zone) return;
            
            _state.ddPlacements[_state.current] = _state.ddPlacements[_state.current] || {};
            const prev = _state.ddPlacements[_state.current][item];
            if (prev === zone) return;
            
            _state.ddPlacements[_state.current][item] = zone;
            this.renderDragDrop(_state.questions[_state.current]);
        },
        
        ddRemoveEl: function(el) {
            const item = el.dataset.item;
            if (!item) return;
            if (_state.ddPlacements[_state.current]) {
                delete _state.ddPlacements[_state.current][item];
            }
            this.renderDragDrop(_state.questions[_state.current]);
        },
        
        /**
         * Toggle flag for current question
         */
        toggleFlag: function() {
            if (_state.flags.has(_state.current)) {
                _state.flags.delete(_state.current);
            } else {
                _state.flags.add(_state.current);
            }
            if (_dom.flagBtn) {
                _dom.flagBtn.className = `flag-btn${_state.flags.has(_state.current) ? ' flagged' : ''}`;
            }
            _renderNavDots();
        },
        
        /**
         * Toggle scenario panel visibility
         */
        toggleScenarioPanel: function() {
            if (_dom.scenarioPanel) {
                _dom.scenarioPanel.style.display = _dom.scenarioPanel.style.display === 'none' ? 'flex' : 'none';
            }
        },
        
        /**
         * Confirm exit from quiz
         */
        confirmExit: function() {
            if (confirm('Exit session? Progress will not be saved.')) {
                if (_timer) _timer.stop();
                // Navigate to home handled by app.js
                if (window.showHome) window.showHome();
            }
        },
        
        /**
         * Reset for a new session (play again)
         */
        playAgain: function() {
            if (_state && _state.topicId) {
                this.launchFreshTopic(_state.topicId);
            }
        }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngine;
} else {
    window.QuizEngine = QuizEngine;
}