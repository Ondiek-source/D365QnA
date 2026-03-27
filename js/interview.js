/**
 * Voice Interview Module
 * 
 * AI-powered interview simulation with speech recognition and synthesis.
 * Handles question flow, scoring via Claude API, transcript management,
 * and session persistence.
 * 
 * @module interview
 */

const Interview = (function() {
    'use strict';
    
    // Private state
    let _state = {
        pack: null,
        packId: null,
        packCfg: null,
        candidateName: '',
        queue: [],
        qIdx: 0,
        followUpCount: 0,
        transcript: [],
        scores: [],
        sessionId: null,
        startTime: null,
        elapsedSecs: 0,
        timerInterval: null,
        isRecording: false,
        isSpeaking: false,
        recognition: null,
        synth: null,
        audioCtx: null,
        analyser: null,
        micStream: null,
        animFrame: null,
        waveInterval: null
    };
    
    // DOM elements cache
    let _dom = {};
    
    // Mood definitions
    const MOODS = {
        neutral: { emoji: '🎙️', cls: '' },
        thinking: { emoji: '🤔', cls: 'mood-thinking' },
        probing: { emoji: '🧐', cls: 'mood-probing' },
        critical: { emoji: '😤', cls: 'mood-critical' },
        impressed: { emoji: '😊', cls: 'mood-impressed' }
    };
    
    /**
     * Cache DOM elements
     */
    function _cacheDOM() {
        _dom = {
            nameModal: document.getElementById('viNameModal'),
            nameInput: document.getElementById('viNameInput'),
            nameBtn: document.getElementById('viNameBtn'),
            namePackTitle: document.getElementById('viNamePackTitle'),
            voiceScreen: document.getElementById('voiceInterviewScreen'),
            resultsScreen: document.getElementById('viResultsScreen'),
            moodEl: document.getElementById('viMood'),
            statusLabel: document.getElementById('viStatusLabel'),
            waveform: document.getElementById('viWaveform'),
            qLabel: document.getElementById('viQLabel'),
            qText: document.getElementById('viQText'),
            micBtn: document.getElementById('viMicBtn'),
            skipBtn: document.getElementById('viSkipBtn'),
            endBtn: document.getElementById('viEndBtn'),
            transcript: document.getElementById('viTranscript'),
            panelMeta: document.getElementById('viPanelMeta'),
            progressFill: document.getElementById('viProgressFill'),
            progressLabel: document.getElementById('viProgressLabel'),
            timerLabel: document.getElementById('viTimerLabel'),
            dlBtn: document.querySelector('.vi-dl-btn'),
            resScore: document.getElementById('viResScore'),
            resDenom: document.getElementById('viResDenom'),
            resBand: document.getElementById('viResBand'),
            resHeading: document.getElementById('viResHeading'),
            resMsg: document.getElementById('viResMsg'),
            resBreakdown: document.getElementById('viResBreakdown')
        };
    }
    
    /**
     * Set mood emoji and class
     */
    function _setMood(key) {
        const m = MOODS[key] || MOODS.neutral;
        if (_dom.moodEl) {
            _dom.moodEl.textContent = m.emoji;
            _dom.moodEl.className = 'vi-mood ' + m.cls;
        }
    }
    
    /**
     * Set status label
     */
    function _setStatus(s) {
        const labels = {
            idle: 'Ready',
            listening: '● Listening…',
            speaking: 'Interviewer Speaking',
            thinking: 'Analysing…'
        };
        if (_dom.statusLabel) {
            _dom.statusLabel.textContent = labels[s] || s;
            _dom.statusLabel.className = 'vi-status ' + (s === 'listening' ? 'listening' : s === 'speaking' ? 'speaking' : s === 'thinking' ? 'thinking' : '');
        }
    }
    
    /**
     * Set mic button state
     */
    function _setMicState(recording) {
        if (!_dom.micBtn) return;
        _dom.micBtn.classList.toggle('recording', recording);
        _dom.micBtn.title = recording ? 'Click to stop and submit answer' : 'Click to start speaking';
        _dom.micBtn.textContent = recording ? '⏹' : '🎤';
    }
    
    /**
     * Initialize waveform bars
     */
    function _initWaveform() {
        if (!_dom.waveform) return;
        _dom.waveform.innerHTML = '';
        const N = 32;
        for (let i = 0; i < N; i++) {
            const b = document.createElement('div');
            b.className = 'vi-bar';
            b.style.height = '4px';
            _dom.waveform.appendChild(b);
        }
    }
    
    /**
     * Animate waveform based on source
     */
    function _animateWaveform(source) {
        cancelAnimationFrame(_state.animFrame);
        const bars = document.querySelectorAll('.vi-bar');
        
        if (source === 'idle') {
            bars.forEach(b => { b.style.height = '4px'; b.classList.remove('ai-bar'); });
            return;
        }
        
        if (source === 'user' && _state.analyser) {
            const data = new Uint8Array(_state.analyser.frequencyBinCount);
            const step = () => {
                _state.analyser.getByteFrequencyData(data);
                bars.forEach((b, i) => {
                    const val = data[Math.floor(i * data.length / bars.length)];
                    const h = 4 + (val / 255) * 68;
                    b.style.height = h + 'px';
                    b.classList.remove('ai-bar');
                });
                _state.animFrame = requestAnimationFrame(step);
            };
            step();
            return;
        }
        
        // AI speaking — synthetic wave
        bars.forEach(b => b.classList.add('ai-bar'));
        let t = 0;
        const step = () => {
            t += 0.12;
            bars.forEach((b, i) => {
                const h = 4 + 32 + Math.sin(t + i * 0.4) * 28 + Math.sin(t * 1.7 + i * 0.2) * 14;
                b.style.height = Math.max(4, h) + 'px';
            });
            _state.animFrame = requestAnimationFrame(step);
        };
        step();
    }
    
    /**
     * Add entry to transcript
     */
    function _addTranscriptEntry(role, text, score, reasoning, mood) {
        const entry = { role, text, score, reasoning, mood, ts: Date.now() };
        _state.transcript.push(entry);
        
        if (!_dom.transcript) return;
        
        const div = document.createElement('div');
        div.className = 'vi-entry';
        const scoreColor = score === null || score === undefined ? 'var(--muted)' :
            score >= 4 ? 'var(--correct)' : score >= 2 ? 'var(--warn)' : 'var(--wrong)';
        
        div.innerHTML = `
            <div class="vi-entry-role ${role}">${role === 'ai' ? 'Interviewer' : _state.candidateName || 'You'}</div>
            <div class="vi-entry-bubble ${role}-bubble">${UI.escapeHtml(text)}
                ${score !== null && score !== undefined ? `<div class="vi-entry-score"><div class="vi-entry-score-dot" style="background:${scoreColor}"></div><span style="color:${scoreColor}">Score: ${score}/5</span>${reasoning ? ` — ${UI.escapeHtml(reasoning.slice(0, 80))}…` : ''}</div>` : ''}
            </div>`;
        _dom.transcript.appendChild(div);
        _dom.transcript.scrollTop = _dom.transcript.scrollHeight;
    }
    
    /**
     * Update progress display
     */
    function _updateProgress() {
        const total = _state.queue.length;
        const done = Math.min(_state.qIdx, total);
        const pct = total ? (done / total) * 100 : 0;
        
        if (_dom.progressFill) _dom.progressFill.style.width = pct + '%';
        if (_dom.progressLabel) _dom.progressLabel.textContent = `${done} of ${total} questions`;
        if (_dom.qLabel) _dom.qLabel.textContent = `Question ${Math.min(_state.qIdx + 1, total)} of ${total}`;
    }
    
    /**
     * Save draft to IndexedDB
     */
    async function _saveDraft() {
        try {
            const draft = {
                id: `vi_draft_${_state.packId}`,
                type: 'voice_interview_draft',
                packId: _state.packId,
                candidateName: _state.candidateName,
                queue: _state.queue,
                qIdx: _state.qIdx,
                transcript: _state.transcript,
                scores: _state.scores,
                elapsedSecs: _state.elapsedSecs,
                startTime: _state.startTime,
                savedAt: Date.now()
            };
            
            await window.dbSaveDraft(draft);
        } catch (e) {
            console.warn('Draft save failed:', e);
        }
    }
    
    /**
     * Clear draft
     */
    async function _clearDraft() {
        try {
            await window.dbClearDraft(`vi_draft_${_state.packId}`);
        } catch (e) {
            console.warn('Draft clear failed:', e);
        }
    }
    
    /**
     * Release microphone resources
     */
    function _releaseMic() {
        if (_state.recognition) {
            try { _state.recognition.stop(); } catch(e) {}
            _state.recognition = null;
        }
        _state.isRecording = false;
        
        if (_state.micStream) {
            _state.micStream.getTracks().forEach(t => t.stop());
            _state.micStream = null;
        }
        
        if (_state.audioCtx) {
            try { _state.audioCtx.close(); } catch(e) {}
            _state.audioCtx = null;
            _state.analyser = null;
        }
        
        cancelAnimationFrame(_state.animFrame);
        _animateWaveform('idle');
    }
    
    /**
     * Speak text using speech synthesis
     */
    function _speak(text, onEnd) {
        if (!_state.synth) {
            if (onEnd) onEnd();
            return;
        }
        
        _state.synth.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.92;
        utt.pitch = 1.0;
        
        const voices = _state.synth.getVoices();
        const preferred = voices.find(v => /Google UK English Male|Daniel|Alex|Arthur/i.test(v.name))
            || voices.find(v => v.lang === 'en-GB')
            || voices.find(v => v.lang.startsWith('en'))
            || voices[0];
        if (preferred) utt.voice = preferred;
        
        utt.onstart = () => {
            _state.isSpeaking = true;
            _setStatus('speaking');
            _animateWaveform('ai');
            _setMood('neutral');
        };
        utt.onend = () => {
            _state.isSpeaking = false;
            _animateWaveform('idle');
            if (onEnd) onEnd();
        };
        utt.onerror = () => {
            _state.isSpeaking = false;
            _animateWaveform('idle');
            if (onEnd) onEnd();
        };
        
        _state.synth.speak(utt);
    }
    
    /**
     * Build question queue from pack
     */
    function _buildQueue(pack) {
        const rules = pack.interview_flow?.selection_rules || {};
        let pool = [];
        
        (pack.sections || []).forEach(sec => {
            const items = sec.items || sec.questions || [];
            items.forEach(item => {
                if (item && (item.question || item.scenario || item.candidate_task)) {
                    pool.push({ ...item, _section: sec.section_name });
                }
            });
        });
        
        const selected = [];
        const usedIds = new Set();
        const add = (item) => {
            if (item && !usedIds.has(item.id)) {
                usedIds.add(item.id);
                selected.push(item);
            }
        };
        
        const pickDomain = (domain, arr) => arr.find(x => (x.domain || '').toLowerCase().includes(domain));
        
        if (rules.force_one_integration_case) add(pickDomain('integration', pool));
        if (rules.force_one_security_or_data_case) add(pickDomain('security', pool) || pickDomain('data', pool));
        if (rules.force_one_behavioral_failure_question) add(pool.find(x => (x.domain || '').toLowerCase().includes('failure')));
        if (rules.prefer_ALM_at_least_twice) {
            pool.filter(x => (x.domain || '').toLowerCase().includes('alm')).slice(0, 2).forEach(add);
        }
        
        let lastDomain = '';
        for (const item of pool) {
            if (usedIds.has(item.id)) continue;
            if (item.domain === lastDomain && rules.avoid_same_domain_back_to_back) continue;
            add(item);
            lastDomain = item.domain || '';
        }
        
        for (const item of pool) {
            if (!usedIds.has(item.id)) add(item);
        }
        
        return selected;
    }
    
    /**
     * Start timer
     */
    function _startTimer() {
        _state.startTime = Date.now();
        _state.timerInterval = setInterval(() => {
            _state.elapsedSecs++;
            const m = Math.floor(_state.elapsedSecs / 60);
            const s = _state.elapsedSecs % 60;
            if (_dom.timerLabel) {
                _dom.timerLabel.textContent = `${m}:${s.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    /**
     * Process answer through Claude API
     */
    async function _processAnswer(transcript) {
        if (!transcript) {
            const retry = "I didn't catch that — please press the mic and try again.";
            _addTranscriptEntry('ai', retry, null);
            _speak(retry, () => {
                _setStatus('idle');
                if (_dom.micBtn) _dom.micBtn.disabled = false;
            });
            return;
        }
        
        _addTranscriptEntry('user', transcript, null);
        _setStatus('thinking');
        _setMood('thinking');
        if (_dom.micBtn) _dom.micBtn.disabled = true;
        
        const item = _state.queue[_state.qIdx];
        const pack = _state.pack;
        const globalProbes = (pack.global_probe_rules || []).join('\n');
        const expectedPoints = (item.expected_points || []);
        const followUps = (item.killer_followups || item.follow_up_probes || []);
        const failTriggers = (item.fail_triggers || []);
        const rubric = pack.scoring_model?.rubric || {};
        
        const systemPrompt = `You are a strict technical interviewer and assessor for a Dynamics 365 Customer Engagement Technical Consultant role.
Your job is to score the candidate's answer with scientific objectivity grounded in official Microsoft documentation.

SCORING RUBRIC (0-5):
${Object.entries(rubric).map(([k, v]) => `  ${k}: ${v}`).join('\n')}

SCORING METHOD — follow this exactly:
1. Compare the candidate's answer against each EXPECTED POINT.
2. Count how many expected points were correctly covered.
3. Check for FAIL TRIGGERS — if any are present, cap score at 2 and set mood to "critical".
4. Base score on coverage ratio.
5. Award 5 only for technically precise answers with correct Microsoft terminology.

Respond with ONLY valid JSON:
{"score":<0-5>,"mood":"neutral"|"thinking"|"probing"|"critical"|"impressed","reasoning":"<2 sentences>","follow_up":"<follow-up if score<4 else empty>","done":<true if score>=4 or followUpCount>=2>,"points_hit":<integer>,"points_total":<integer>}`;
        
        const userMsg = `QUESTION: "${item.question || item.scenario || ''}"

EXPECTED POINTS (${expectedPoints.length} total):
${expectedPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n') || '  - General technical accuracy'}

FAIL TRIGGERS:
${failTriggers.map(f => `  - ${f}`).join('\n') || '  - None'}

AVAILABLE FOLLOW-UPS:
${followUps.map(f => `  - ${f}`).join('\n') || '  - None'}

FOLLOW-UPS ALREADY ASKED: ${_state.followUpCount}

CANDIDATE ANSWER: "${transcript}"`;
        
        let result = { score: 2, mood: 'thinking', reasoning: 'Answer noted.', follow_up: '', done: true, points_hit: 0, points_total: expectedPoints.length };
        
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 400,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMsg }]
                })
            });
            clearTimeout(timeout);
            const data = await res.json();
            if (data.error) throw new Error(data.error.message || 'API error');
            const raw = (data.content?.[0]?.text || '{}').replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(raw);
            if (typeof parsed.score === 'number' && typeof parsed.done === 'boolean') {
                result = parsed;
            }
        } catch (e) {
            console.warn('Claude API error:', e.message);
        }
        
        _setMood(result.mood || 'neutral');
        
        if (result.done || _state.followUpCount >= 2) {
            _state.scores.push({
                questionId: item.id || '?',
                question: item.question || item.scenario || '',
                score: result.score,
                reasoning: result.reasoning || '',
                mood: result.mood || 'neutral',
                points_hit: result.points_hit,
                points_total: result.points_total
            });
            _state.qIdx++;
            _state.followUpCount = 0;
            
            const ack = result.score >= 4
                ? `Good answer, ${_state.candidateName}. Let's move on.`
                : result.score <= 1
                    ? `I'd like to see more depth there. Let's continue.`
                    : `Thank you. Moving to the next question.`;
            
            _addTranscriptEntry('ai', ack, null);
            _speak(ack, () => {
                if (_dom.micBtn) _dom.micBtn.disabled = false;
                _setStatus('idle');
                _askQuestion();
            });
        } else if (result.follow_up) {
            _state.followUpCount++;
            _addTranscriptEntry('ai', result.follow_up, null, null, result.mood);
            if (_dom.qText) _dom.qText.textContent = result.follow_up;
            if (_dom.micBtn) _dom.micBtn.disabled = true;
            _speak(result.follow_up, () => {
                if (_dom.micBtn) _dom.micBtn.disabled = false;
                _setStatus('idle');
            });
        } else {
            _state.scores.push({
                questionId: item.id || '?',
                question: item.question || item.scenario || '',
                score: result.score,
                reasoning: result.reasoning || '',
                mood: result.mood || 'neutral',
                points_hit: result.points_hit,
                points_total: result.points_total
            });
            _state.qIdx++;
            _state.followUpCount = 0;
            _askQuestion();
        }
        
        _saveDraft();
    }
    
    /**
     * Ask current question
     */
    function _askQuestion() {
        if (_state.qIdx >= _state.queue.length) {
            _conclude();
            return;
        }
        
        const item = _state.queue[_state.qIdx];
        _state.followUpCount = 0;
        
        let spoken = item.question || '';
        if (!spoken && item.scenario) {
            spoken = `Here is a scenario. ${item.scenario} Your task: ${item.candidate_task || ''}`;
        }
        
        if (_dom.qText) _dom.qText.textContent = spoken.slice(0, 180) + (spoken.length > 180 ? '…' : '');
        _updateProgress();
        _addTranscriptEntry('ai', spoken, null, null, 'neutral');
        _setMood('neutral');
        
        if (_dom.skipBtn) {
            _dom.skipBtn.style.opacity = '1';
            _dom.skipBtn.style.pointerEvents = 'auto';
        }
        
        if (_dom.micBtn) _dom.micBtn.disabled = true;
        
        _speak(spoken, () => {
            if (_dom.micBtn) _dom.micBtn.disabled = false;
            _setStatus('idle');
            _setMood('thinking');
        });
    }
    
    /**
     * Conclude interview and save results
     */
    async function _conclude() {
        clearInterval(_state.timerInterval);
        _releaseMic();
        _setMood('impressed');
        _setStatus('idle');
        if (_dom.micBtn) _dom.micBtn.disabled = true;
        
        const total = _state.scores.reduce((a, s) => a + (s.score || 0), 0);
        const avg = _state.scores.length ? Math.round((total / _state.scores.length) * 10) / 10 : 0;
        
        const closing = `Thank you, ${_state.candidateName}. That concludes our interview. You averaged ${avg} out of 5. Your full transcript and scores are now available. Well done.`;
        _addTranscriptEntry('ai', closing, null);
        
        _speak(closing, async () => {
            const record = {
                type: 'voice_interview',
                packId: _state.packId,
                packName: _state.pack?.pack_name || '',
                candidateName: _state.candidateName,
                scores: _state.scores,
                avgScore: avg,
                totalScore: Math.round(avg * 100),
                transcript: _state.transcript,
                elapsedSecs: _state.elapsedSecs,
                questionCount: _state.scores.length,
                date: Date.now(),
                topicId: `vi_${_state.packId}`,
                topicTitle: _state.pack?.target_role || 'Voice Interview'
            };
            
            await window.dbSave(record);
            await _clearDraft();
            _showResults(avg, record);
        });
    }
    
    /**
     * Show results screen
     */
    function _showResults(avg, record) {
        if (UI) UI.showScreen('viResultsScreen');
        
        const band = avg >= 4.5 ? 'OUTSTANDING' : avg >= 3.5 ? 'STRONG' : avg >= 2.5 ? 'COMPETENT' : avg >= 1.5 ? 'DEVELOPING' : 'NEEDS WORK';
        const bandColor = avg >= 4 ? 'var(--correct)' : avg >= 2.5 ? 'var(--warn)' : 'var(--wrong)';
        const msg = avg >= 4
            ? `Excellent performance, ${_state.candidateName}. You demonstrated strong technical depth.`
            : avg >= 2.5
                ? `Solid effort, ${_state.candidateName}. Review lower-scored questions before your real interview.`
                : `Clear gaps to address, ${_state.candidateName}. Study the expected points for low-scoring questions.`;
        
        if (_dom.resScore) {
            _dom.resScore.textContent = avg.toFixed(1);
            _dom.resScore.style.color = bandColor;
        }
        if (_dom.resBand) {
            _dom.resBand.textContent = band;
            _dom.resBand.style.color = bandColor;
        }
        if (_dom.resHeading) _dom.resHeading.textContent = `${band} — ${avg.toFixed(1)} / 5`;
        if (_dom.resMsg) _dom.resMsg.textContent = msg;
        
        const scores = record.scores || [];
        const totalPointsHit = scores.reduce((a, s) => a + (s.points_hit || 0), 0);
        const totalPointsPossible = scores.reduce((a, s) => a + (s.points_total || 0), 0);
        const coveragePct = totalPointsPossible ? Math.round((totalPointsHit / totalPointsPossible) * 100) : 0;
        
        const moodEmoji = { neutral: '🎙️', thinking: '🤔', probing: '🧐', critical: '😤', impressed: '😊' };
        const breakdown = scores.map((s, i) => {
            const c = s.score >= 4 ? 'var(--correct)' : s.score >= 2 ? 'var(--warn)' : 'var(--wrong)';
            const coverageStr = (s.points_total > 0)
                ? `<span style="font-size:10px;color:var(--muted);margin-left:8px">${s.points_hit || 0}/${s.points_total} points covered</span>`
                : '';
            return `<div class="vi-q-result">
                <div class="vi-q-result-header">
                    <div class="vi-q-result-score" style="color:${c}">${moodEmoji[s.mood] || '🎙️'} ${s.score}/5${coverageStr}</div>
                    <div class="vi-q-result-q">${UI.escapeHtml((s.question || '').slice(0, 140))}${(s.question || '').length > 140 ? '…' : ''}</div>
                </div>
                <div class="vi-q-result-reasoning" style="color:${s.score <= 1 ? 'var(--wrong)' : s.score <= 2 ? 'var(--warn)' : 'var(--muted)'}">${UI.escapeHtml(s.reasoning || '')}</div>
            </div>`;
        }).join('');
        
        if (_dom.resBreakdown) {
            _dom.resBreakdown.innerHTML = `
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);margin-bottom:24px">
                    <div class="bd-cell"><span class="bd-n" style="color:${bandColor}">${avg.toFixed(1)}</span><div class="bd-l">Avg Score /5</div></div>
                    <div class="bd-cell"><span class="bd-n" style="color:var(--accent)">${coveragePct}%</span><div class="bd-l">Points Coverage</div></div>
                    <div class="bd-cell"><span class="bd-n" style="color:var(--muted2)">${scores.length}</span><div class="bd-l">Questions Scored</div></div>
                </div>
                ${breakdown}`;
        }
    }
    
    /**
     * Start listening for user speech
     */
    async function _startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            _addTranscriptEntry('ai', '⚠ Your browser does not support speech recognition. Please use Chrome or Edge.', null);
            return;
        }
        
        if (!_state.audioCtx) {
            try {
                _state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                _state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                _state.analyser = _state.audioCtx.createAnalyser();
                _state.analyser.fftSize = 256;
                const src = _state.audioCtx.createMediaStreamSource(_state.micStream);
                src.connect(_state.analyser);
            } catch (e) {
                _addTranscriptEntry('ai', '⚠ Microphone access denied. Please allow mic access and try again.', null);
                return;
            }
        }
        
        const rec = new SpeechRecognition();
        rec.lang = 'en-GB';
        rec.continuous = true;
        rec.interimResults = false;
        _state.recognition = rec;
        
        let finalTranscript = '';
        rec.onresult = e => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
            }
        };
        rec.onend = () => {
            if (_state.isRecording) {
                _processAnswer(finalTranscript.trim());
            }
        };
        rec.onerror = e => {
            console.warn('Speech recognition error:', e.error);
            if (_state.isRecording) _stopListening();
        };
        
        _state.isRecording = true;
        _setMicState(true);
        _setStatus('listening');
        _animateWaveform('user');
        rec.start();
    }
    
    /**
     * Stop listening
     */
    function _stopListening() {
        if (_state.recognition) {
            _state.recognition.stop();
            _state.recognition = null;
        }
        _state.isRecording = false;
        _setMicState(false);
        _setStatus('thinking');
        _animateWaveform('idle');
    }
    
    /**
     * Toggle mic recording
     */
    function _toggleMic() {
        if (_state.isSpeaking) return;
        if (_state.isRecording) {
            _stopListening();
        } else {
            _startListening();
        }
    }
    
    /**
     * Skip current question
     */
    function _skipQuestion() {
        if (_state.isSpeaking) _state.synth?.cancel();
        if (_state.isRecording) _stopListening();
        
        _state.scores.push({
            questionId: _state.queue[_state.qIdx]?.id || '?',
            question: _state.queue[_state.qIdx]?.question || '',
            score: 0,
            reasoning: 'Skipped',
            mood: 'neutral'
        });
        _state.qIdx++;
        _state.followUpCount = 0;
        _askQuestion();
    }
    
    /**
     * Confirm end of interview
     */
    function _confirmEnd() {
        if (confirm('End the interview now? Your progress so far will be scored and saved.')) {
            if (_state.isSpeaking) _state.synth?.cancel();
            _releaseMic();
            _conclude();
        }
    }
    
    /**
     * Download transcript
     */
    function _downloadTranscript() {
        const lines = _state.transcript.map(e => {
            const role = e.role === 'ai' ? 'INTERVIEWER' : _state.candidateName.toUpperCase() || 'CANDIDATE';
            const score = (e.score !== null && e.score !== undefined) ? ` [Score: ${e.score}/5]` : '';
            return `[${role}]${score}\n${e.text}\n`;
        }).join('\n');
        
        const header = `D365 MASTERY — VOICE INTERVIEW TRANSCRIPT\nPack: ${_state.pack?.pack_name || ''}\nCandidate: ${_state.candidateName}\nDate: ${new Date().toLocaleString()}\nDuration: ${Math.floor(_state.elapsedSecs / 60)}m ${_state.elapsedSecs % 60}s\n${'─'.repeat(60)}\n\n`;
        const blob = new Blob([header + lines], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `interview_transcript_${_state.candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
    }
    
    // Public API
    return {
        /**
         * Initialize interview module
         */
        init: function() {
            _cacheDOM();
            _state.synth = window.speechSynthesis || null;
            _initWaveform();
            
            // Attach event listeners if elements exist
            if (_dom.nameBtn) {
                _dom.nameBtn.onclick = () => this.startInterview();
            }
            if (_dom.micBtn) {
                _dom.micBtn.onclick = () => _toggleMic();
            }
            if (_dom.skipBtn) {
                _dom.skipBtn.onclick = () => _skipQuestion();
            }
            if (_dom.endBtn) {
                _dom.endBtn.onclick = () => _confirmEnd();
            }
            if (_dom.dlBtn) {
                _dom.dlBtn.onclick = () => _downloadTranscript();
            }
            if (_dom.nameInput) {
                _dom.nameInput.oninput = () => {
                    const val = _dom.nameInput.value.trim();
                    if (_dom.nameBtn) _dom.nameBtn.disabled = val.length < 2;
                };
                _dom.nameInput.onkeydown = (e) => {
                    if (e.key === 'Enter') this.startInterview();
                };
            }
            
            return this;
        },
        
        /**
         * Load an interview pack
         */
        loadPack: async function(packId) {
            const packCfg = (window.CONFIG?.INTERVIEW_PACKS || []).find(p => p.id === packId);
            if (!packCfg) return;
            
            if (UI) UI.showLoading(true, 'Loading interview pack…');
            
            try {
                const pack = await window.fetchInterviewPack(packCfg);
                _state.pack = pack;
                _state.packId = packId;
                _state.packCfg = packCfg;
                
                if (UI) UI.showLoading(false);
                
                if (_dom.namePackTitle) {
                    _dom.namePackTitle.textContent = pack.target_role || pack.pack_name || 'Technical Interview';
                }
                if (_dom.nameInput) _dom.nameInput.value = '';
                if (_dom.nameBtn) _dom.nameBtn.disabled = true;
                if (UI) UI.openModal('viNameModal');
                
            } catch (err) {
                console.error('Interview pack load failed:', err);
                if (UI) UI.showLoading(false);
            }
        },
        
        /**
         * Start the interview after name entry
         */
        startInterview: function() {
            const name = _dom.nameInput ? _dom.nameInput.value.trim() : '';
            if (name.length < 2) return;
            
            if (UI) UI.closeModal();
            
            _state.candidateName = name;
            _state.qIdx = 0;
            _state.followUpCount = 0;
            _state.transcript = [];
            _state.scores = [];
            _state.elapsedSecs = 0;
            _state.sessionId = Date.now();
            
            _initWaveform();
            _setMood('neutral');
            _setStatus('idle');
            if (_dom.micBtn) _dom.micBtn.disabled = true;
            if (_dom.skipBtn) {
                _dom.skipBtn.style.opacity = '0';
                _dom.skipBtn.style.pointerEvents = 'none';
            }
            if (_dom.transcript) _dom.transcript.innerHTML = '';
            if (_dom.panelMeta) {
                _dom.panelMeta.textContent = `${_state.pack?.pack_name || 'Interview'} · ${name}`;
            }
            
            _state.queue = _buildQueue(_state.pack);
            _updateProgress();
            
            if (UI) UI.showScreen('voiceInterviewScreen');
            _startTimer();
            
            const sections = [...new Set(_state.queue.map(q => q._section || q.domain || 'General').filter(Boolean))].slice(0, 4);
            const plan = sections.join(', ');
            const greeting = `Hello ${name}, I'm your technical interviewer today. We're conducting the ${_state.pack?.target_role || 'technical'} interview. We'll cover ${_state.queue.length} questions across ${plan}, and a few others. I'll follow up where I need more depth. When you're ready to answer, press the microphone button. Let's begin.`;
            
            _addTranscriptEntry('ai', greeting, null, null, 'neutral');
            _setStatus('speaking');
            _speak(greeting, () => {
                _setStatus('idle');
                if (_dom.micBtn) _dom.micBtn.disabled = false;
                _askQuestion();
            });
        },
        
        /**
         * Get current interview state
         */
        getState: function() {
            return _state;
        }
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Interview;
} else {
    window.Interview = Interview;
}