// Main Application Logic
(function() {
    'use strict';

    // State
    let currentCategory = null;
    let currentScenario = null;
    let currentMode = 'all';
    let history = [];
    const MAX_HISTORY = 5;

    // Initialize app
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        renderCategories();
        renderQuickExamples();
        setupModeChips();
        setupInputListeners();
    }

    // View Navigation
    window.showView = function(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    };

    window.goBackFromScenario = function() {
        if (currentCategory) {
            showCategoryDetail(currentCategory.id);
        } else {
            showView('home-view');
        }
    };

    // Render Categories
    function renderCategories() {
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';

        Object.values(CATEGORIES).forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = category.id;
            card.onclick = () => showCategoryDetail(category.id);

            card.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>
                <span class="category-badge">${category.scenarios.length}</span>
            `;

            grid.appendChild(card);
        });
    }

    // Show Category Detail
    window.showCategoryDetail = function(categoryId) {
        currentCategory = CATEGORIES[categoryId];
        if (!currentCategory) return;

        document.getElementById('category-title').textContent = currentCategory.name;

        // Render header card
        const headerCard = document.getElementById('category-header-card');
        headerCard.innerHTML = `
            <div class="category-header-icon" style="background: ${hexToRgba(currentCategory.color, 0.15)}">
                ${currentCategory.icon}
            </div>
            <h2>${currentCategory.name}</h2>
            <p>${currentCategory.description}</p>
        `;

        // Render scenarios
        const list = document.getElementById('scenarios-list');
        list.innerHTML = '';

        currentCategory.scenarios.forEach(scenario => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.onclick = () => showScenarioDetail(scenario.id);

            card.innerHTML = `
                <h4>${scenario.title}</h4>
                <p>${scenario.description}</p>
                <div class="scenario-example">${escapeHtml(scenario.exampleInput)}</div>
            `;

            list.appendChild(card);
        });

        showView('category-view');
    };

    // Show Scenario Detail
    window.showScenarioDetail = function(scenarioId) {
        // Find scenario across all categories
        for (const category of Object.values(CATEGORIES)) {
            const scenario = category.scenarios.find(s => s.id === scenarioId);
            if (scenario) {
                currentScenario = scenario;
                currentCategory = category;
                break;
            }
        }

        if (!currentScenario) return;

        document.getElementById('scenario-title').textContent = currentScenario.title;

        // Render scenario info
        const info = document.getElementById('scenario-info');
        info.innerHTML = `
            <span class="scenario-badge" style="background: ${hexToRgba(currentCategory.color, 0.15)}; color: ${currentCategory.color}">
                ${currentCategory.icon} ${currentCategory.name}
            </span>
            <p>${currentScenario.description}</p>
        `;

        // Set input
        const input = document.getElementById('scenario-input');
        input.value = currentScenario.exampleInput;
        updateCharCount('scenario');

        // Clear result
        document.getElementById('scenario-result').innerHTML = '';

        showView('scenario-view');
    };

    // Reset Scenario Input
    window.resetScenarioInput = function() {
        if (currentScenario) {
            document.getElementById('scenario-input').value = currentScenario.exampleInput;
            updateCharCount('scenario');
        }
    };

    // Run Scenario Check
    window.runScenarioCheck = async function() {
        const input = document.getElementById('scenario-input').value.trim();
        if (!input || !currentScenario) return;

        const btn = document.getElementById('scenario-run-btn');
        setButtonLoading(btn, true);

        // Simulate processing delay
        await delay(400);

        const result = GuardrailService.checkScenario(currentScenario.id, input);
        renderResult('scenario-result', result);

        setButtonLoading(btn, false);
    };

    // Setup Mode Chips
    function setupModeChips() {
        document.querySelectorAll('.mode-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentMode = chip.dataset.mode;
            });
        });
    }

    // Render Quick Examples
    function renderQuickExamples() {
        const grid = document.getElementById('examples-grid');
        grid.innerHTML = '';

        QUICK_EXAMPLES.forEach(example => {
            const btn = document.createElement('button');
            btn.className = 'example-btn';
            btn.onclick = () => {
                document.getElementById('playground-input').value = example.text;
                updateCharCount('playground');
            };

            btn.innerHTML = `
                <span class="example-icon">${example.icon}</span>
                <span>${example.label}</span>
            `;

            grid.appendChild(btn);
        });
    }

    // Run Playground Check
    window.runPlaygroundCheck = async function() {
        const input = document.getElementById('playground-input').value.trim();
        if (!input) return;

        const btn = document.getElementById('playground-run-btn');
        setButtonLoading(btn, true);

        // Simulate processing delay
        await delay(400);

        const result = GuardrailService.checkByMode(currentMode, input);
        renderResult('playground-result', result);

        // Add to history
        addToHistory(input, currentMode, result);

        setButtonLoading(btn, false);
    };

    // Add to History
    function addToHistory(input, mode, result) {
        const entry = {
            input,
            mode,
            result,
            timestamp: new Date()
        };

        history.unshift(entry);
        if (history.length > MAX_HISTORY) {
            history.pop();
        }

        renderHistory();
    }

    // Render History
    function renderHistory() {
        const section = document.getElementById('history-section');
        const list = document.getElementById('history-list');

        if (history.length === 0) {
            section.hidden = true;
            return;
        }

        section.hidden = false;
        list.innerHTML = '';

        history.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.onclick = () => restoreHistory(index);

            const timeAgo = getTimeAgo(entry.timestamp);

            item.innerHTML = `
                <div class="history-status ${entry.result.status}"></div>
                <div class="history-info">
                    <div class="history-text">${escapeHtml(entry.input)}</div>
                    <div class="history-meta">${entry.mode.toUpperCase()} • ${timeAgo}</div>
                </div>
            `;

            list.appendChild(item);
        });
    }

    // Restore from History
    function restoreHistory(index) {
        const entry = history[index];
        if (!entry) return;

        document.getElementById('playground-input').value = entry.input;
        updateCharCount('playground');

        // Set mode
        currentMode = entry.mode;
        document.querySelectorAll('.mode-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.mode === entry.mode);
        });

        // Show result
        renderResult('playground-result', entry.result);
    }

    // Render Result
    function renderResult(containerId, result) {
        const container = document.getElementById(containerId);

        const statusIcons = {
            allowed: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
            blocked: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
            flagged: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
            sanitized: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41l-2.33-2.35z"/></svg>'
        };

        const statusLabels = {
            allowed: 'ALLOWED',
            blocked: 'BLOCKED',
            flagged: 'FLAGGED',
            sanitized: 'SANITIZED'
        };

        let html = `
            <div class="result-card">
                <div class="result-badge ${result.status}">
                    ${statusIcons[result.status]}
                    ${statusLabels[result.status]}
                </div>

                <div class="result-section">
                    <h4>Analysis</h4>
                    <p>${result.reason}</p>
                </div>
        `;

        if (result.detectedItems && result.detectedItems.length > 0) {
            html += `
                <div class="result-section">
                    <h4>Detected Items</h4>
                    <ul>
                        ${result.detectedItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (result.sanitizedOutput) {
            html += `
                <div class="result-section">
                    <h4>Sanitized Output</h4>
                    <div class="sanitized-output">${escapeHtml(result.sanitizedOutput)}</div>
                </div>
            `;
        }

        html += `
                <div class="result-section">
                    <h4>Confidence Score</h4>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${result.confidence * 100}%"></div>
                    </div>
                    <div class="confidence-text">${Math.round(result.confidence * 100)}% confidence</div>
                </div>

                <button class="clear-result-btn" onclick="clearResult('${containerId}')">Clear Result</button>
            </div>
        `;

        container.innerHTML = html;
    }

    // Clear Result
    window.clearResult = function(containerId) {
        document.getElementById(containerId).innerHTML = '';
    };

    // Setup Input Listeners
    function setupInputListeners() {
        document.getElementById('playground-input').addEventListener('input', () => {
            updateCharCount('playground');
        });

        document.getElementById('scenario-input').addEventListener('input', () => {
            updateCharCount('scenario');
        });
    }

    // Update Character Count
    function updateCharCount(type) {
        const input = document.getElementById(`${type}-input`);
        const counter = document.getElementById(`${type}-char-count`);
        counter.textContent = `${input.value.length} characters`;
    }

    // Set Button Loading State
    function setButtonLoading(btn, loading) {
        const textSpan = btn.querySelector('.run-btn-text');
        const loaderSpan = btn.querySelector('.run-btn-loader');

        if (loading) {
            btn.disabled = true;
            textSpan.hidden = true;
            loaderSpan.hidden = false;
        } else {
            btn.disabled = false;
            textSpan.hidden = false;
            loaderSpan.hidden = true;
        }
    }

    // Utility Functions
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
})();
