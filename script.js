document.addEventListener('DOMContentLoaded', function() {
    
    // --- ELEMENTE HOLEN ---
    const sidebar = document.getElementById('mySidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const meineTabelle = document.getElementById('tableContainer');
    
    // Standard Buttons
    const erstelleBtn = document.getElementById('createTable');
    const addSpalteBtn = document.getElementById('addspalte');
    const removeSpalteBtn = document.getElementById("removespalte");
    const addZeileBtn = document.getElementById('addzeile');
    const removeZeileBtn = document.getElementById("removezeile");

    // Darts Elements
    const dartsPresetBtn = document.getElementById("dartsBtn");
    const dartsConfig = document.getElementById("darts-config");
    const startDartsBtn = document.getElementById('createDartsTable');
    const modusSelect = document.getElementById('darts-modus');
    const matchSettings = document.getElementById('match-settings');
    const advancedStatsCheckbox = document.getElementById('advancedStats');
    const statsList = document.getElementById('stats-list');
    const statCheckboxes = document.querySelectorAll('.stat-checkbox');
    const selectAllStats = document.getElementById('selectAllStats');

    // Minigolf Elements
    const minigolfConfig = document.getElementById('minigolf-config');
    const minigolfPresetBtn = document.getElementById('minigolfBtn');
    const startMinigolfBtn = document.getElementById('createMinigolfTable');
    // Minigolf Stats Elements
    const mgStatsCheckbox = document.getElementById('minigolfAdvancedStats');
    const mgStatsList = document.getElementById('minigolf-stats-list');
    const mgSelectAll = document.getElementById('minigolfSelectAll');
    const mgStatCheckboxes = document.querySelectorAll('.mg-stat-checkbox');

    // Badminton Elements
    const badmintonConfig = document.getElementById('badminton-config');
    const badmintonPresetBtn = document.getElementById('badmintonBtn');
    const startBadmintonBtn = document.getElementById('createBadmintonTable');

    // 1. SIDEBAR TOGGLE
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => { sidebar.classList.toggle('collapsed'); });
    }

    // 2. AKKORDEON LOGIK
    const acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null; panel.classList.remove('open'); 
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px"; panel.classList.add('open'); 
            } 
        });
    }

    // 3. PRESET TABS
    function hideAllConfigs() {
        if(dartsConfig) dartsConfig.style.display = "none";
        if(minigolfConfig) minigolfConfig.style.display = "none";
        if(badmintonConfig) badmintonConfig.style.display = "none";
    }
    if(dartsPresetBtn) {
        dartsPresetBtn.addEventListener('click', function() {
            const isHidden = (dartsConfig.style.display === "none" || dartsConfig.style.display === "");
            hideAllConfigs();
            if(isHidden) dartsConfig.style.display = "block";
        });
    }
    if(minigolfPresetBtn) {
        minigolfPresetBtn.addEventListener('click', function() {
            const isHidden = (minigolfConfig.style.display === "none" || minigolfConfig.style.display === "");
            hideAllConfigs();
            if(isHidden) minigolfConfig.style.display = "block";
        });
    }
    if(badmintonPresetBtn) {
        badmintonPresetBtn.addEventListener('click', function() {
            const isHidden = (badmintonConfig.style.display === "none" || badmintonConfig.style.display === "");
            hideAllConfigs();
            if(isHidden) badmintonConfig.style.display = "block";
        });
    }

    // 4. STATISTIK CHECKBOXEN (DARTS)
    function checkModus() { if(matchSettings) matchSettings.style.display = (modusSelect.value === '501do') ? 'block' : 'none'; }
    function checkStats() {
        if(advancedStatsCheckbox.checked) {
            statsList.style.display = 'flex';
            if(meineTabelle.classList.contains('darts-mode')) updateHeaderStats();
        } else {
            statsList.style.display = 'none';
            if(meineTabelle.classList.contains('darts-mode')) clearHeaderStats();
        }
    }
    if(modusSelect) modusSelect.addEventListener('change', checkModus);
    if(advancedStatsCheckbox) advancedStatsCheckbox.addEventListener('change', checkStats);
    if(modusSelect) checkModus(); 
    if(advancedStatsCheckbox) checkStats();

    if(selectAllStats) {
        selectAllStats.addEventListener('change', function() {
            statCheckboxes.forEach(cb => cb.checked = this.checked);
            if(meineTabelle.classList.contains('darts-mode') && advancedStatsCheckbox.checked) updateHeaderStats();
        });
    }
    statCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if(!this.checked && selectAllStats) selectAllStats.checked = false;
            if(meineTabelle.classList.contains('darts-mode') && advancedStatsCheckbox.checked) updateHeaderStats();
        });
    });

    // 5. STATISTIK CHECKBOXEN (MINIGOLF)
    if(mgStatsCheckbox) {
        mgStatsCheckbox.addEventListener('change', function() {
            if(this.checked) {
                mgStatsList.style.display = 'flex';
                updateMinigolfStats();
            } else {
                mgStatsList.style.display = 'none';
                const sAnz = parseInt(document.getElementById("minigolf-spielerzahl").value) || 2;
                for(let i=1; i<=sAnz; i++) {
                    const c = document.getElementById(`minigolf-stats-p${i}`);
                    if(c) c.style.display = 'none';
                }
            }
        });
    }
    if(mgSelectAll) {
        mgSelectAll.addEventListener('change', function() {
            const status = this.checked;
            mgStatCheckboxes.forEach(cb => cb.checked = status);
            updateMinigolfStats();
        });
    }
    mgStatCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if(!this.checked && mgSelectAll) mgSelectAll.checked = false;
            updateMinigolfStats();
        });
    });


    // --- UNIVERSAL RECHNER ---
    meineTabelle.addEventListener('input', e => {
        const target = e.target;
        
        // A) STANDARD & MINIGOLF
        if(!meineTabelle.classList.contains('darts-mode') && target.classList.contains('stp')) {
            
            // MINIGOLF LOGIK
            if(meineTabelle.classList.contains('minigolf-mode')) {
                let val = parseInt(target.textContent);
                if(val > 7) { target.textContent = "7"; } 

                const spielerNr = target.getAttribute('data-player-index');
                let spaltenSumme = 0;
                const alleZellen = document.querySelectorAll(`.stp[data-player-index="${spielerNr}"]`);
                
                alleZellen.forEach(zelle => {
                    spaltenSumme += (parseInt(zelle.textContent) || 0);
                });

                const summenFeld = document.getElementById("summe-spieler-" + spielerNr);
                if(summenFeld) summenFeld.textContent = spaltenSumme;

                updateMinigolfStats();
            } 
            // STANDARD LOGIK
            else {
                let row = target.parentElement;
                let sum = 0;
                row.querySelectorAll('.stp').forEach(cell => {
                    sum += (parseInt(cell.textContent) || 0);
                });
                let g = row.querySelector('.gesamt-zelle');
                if(g) g.textContent = sum;
            }
        }

        // BADMINTON LOGIK
        else if(meineTabelle.classList.contains('badminton-mode') && target.classList.contains('badminton-input')) {
            
            let row = target.parentElement.parentElement;
            let inputs = row.querySelectorAll('.badminton-input');
            
            if(inputs.length >= 2) {
                let p1Score = parseInt(inputs[0].value) || 0;
                let p2Score = parseInt(inputs[1].value) || 0;

                inputs[0].style.backgroundColor = ""; inputs[0].style.color = "";
                inputs[1].style.backgroundColor = ""; inputs[1].style.color = "";

                let p1Wins = false;
                let p2Wins = false;

                if( (p1Score >= 21 && p1Score >= p2Score + 2) || p1Score === 30 ) p1Wins = true;
                else if( (p2Score >= 21 && p2Score >= p1Score + 2) || p2Score === 30 ) p2Wins = true;

                if(p1Wins) { inputs[0].style.backgroundColor = "#00e676"; inputs[0].style.color = "#000"; }
                if(p2Wins) { inputs[1].style.backgroundColor = "#00e676"; inputs[1].style.color = "#000"; }
            }
        }
    });

 // --- STANDARD TABELLE ENGINE ---
    function standardTabelleErstellen() {
        meineTabelle.innerHTML = '';
        meineTabelle.classList.remove('darts-mode', 'minigolf-mode', 'badminton-mode');

        const rows = parseInt(document.getElementById('spielerzahl').value) || 2;
        const cols = parseInt(document.getElementById('spielanzahl').value) || 5;

        let thead = meineTabelle.createTHead();
        let tr = thead.insertRow();
        
        // Header 1: Spieler Name
        let th = document.createElement('th');
        th.textContent = "SPIELER";
        th.contentEditable = "true"; 
        tr.appendChild(th);

        // Header 2: Die Spiele (Spalten)
        for(let i=1; i<=cols; i++) {
            let th = document.createElement('th'); 
            th.textContent = "SPIEL "+i; 
            th.contentEditable = "true"; 
            tr.appendChild(th);
        }
        
        let thGesamt = document.createElement('th');
        thGesamt.textContent = "GESAMT";
        tr.appendChild(thGesamt);

        let tbody = meineTabelle.createTBody();
        for(let i=1; i<=rows; i++) {
            let r = tbody.insertRow();
            let name = r.insertCell();
            name.textContent = "Spieler "+i; name.contentEditable = "true";
            
            for(let j=0; j<cols; j++) {
                let c = r.insertCell(); c.contentEditable = "true"; c.className = "stp";
            }
            let g = r.insertCell(); g.textContent = "0"; g.className = "gesamt-zelle";
        }
    }
    if(erstelleBtn) erstelleBtn.addEventListener('click', standardTabelleErstellen);

    // --- STANDARD ADD/REMOVE BUTTONS ---
    
    // Spalte hinzufügen
    if(addSpalteBtn) addSpalteBtn.addEventListener('click', function() {
        if(meineTabelle.classList.contains('darts-mode') || meineTabelle.classList.contains('minigolf-mode') || meineTabelle.classList.contains('badminton-mode')) return;
        const thead = meineTabelle.querySelector('thead');
        const tbody = meineTabelle.querySelector('tbody');
        if(!thead) return;
        
        const headRow = thead.querySelector('tr');
        const numCols = headRow.cells.length;
        
        // Neue Spalte VOR der "Gesamt"-Spalte einfügen
        const newTh = document.createElement('th');
        newTh.textContent = "SPIEL " + (numCols - 1);
        newTh.contentEditable = "true"; // <--- AUCH HIER WICHTIG!
        
        headRow.insertBefore(newTh, headRow.lastElementChild);

        tbody.querySelectorAll('tr').forEach(r => {
            const newCell = r.insertCell(r.cells.length - 1);
            newCell.contentEditable = "true";
            newCell.className = "stp";
        });
    });

    // Spalte entfernen
    if(removeSpalteBtn) removeSpalteBtn.addEventListener('click', function() {
        if(meineTabelle.classList.contains('darts-mode') || meineTabelle.classList.contains('minigolf-mode') || meineTabelle.classList.contains('badminton-mode')) return;
        const thead = meineTabelle.querySelector('thead');
        const tbody = meineTabelle.querySelector('tbody');
        if(!thead) return;
        const headRow = thead.querySelector('tr');
        if(headRow.cells.length <= 2) return; // Nicht unter 1 Spielspalte gehen

        // Vorletzte Zelle löschen
        headRow.deleteCell(headRow.cells.length - 2);
        tbody.querySelectorAll('tr').forEach(r => {
            r.deleteCell(r.cells.length - 2);
        });
    });

    // Zeile hinzufügen
    if(addZeileBtn) addZeileBtn.addEventListener('click', function() {
        if(meineTabelle.classList.contains('darts-mode') || meineTabelle.classList.contains('minigolf-mode') || meineTabelle.classList.contains('badminton-mode')) return;
        const tbody = meineTabelle.querySelector('tbody');
        if(!tbody) return;
        
        // Anzahl Spalten ermitteln (minus Name und Gesamt)
        const cols = meineTabelle.rows[0].cells.length - 2; 
        
        const r = tbody.insertRow();
        const name = r.insertCell();
        name.textContent = "Neuer Spieler";
        name.contentEditable = "true";

        for(let i=0; i<cols; i++) {
            let c = r.insertCell();
            c.contentEditable = "true";
            c.className = "stp";
        }
        let g = r.insertCell();
        g.textContent = "0";
        g.className = "gesamt-zelle";
    });

    // Zeile entfernen
    if(removeZeileBtn) removeZeileBtn.addEventListener('click', function() {
        if(meineTabelle.classList.contains('darts-mode') || meineTabelle.classList.contains('minigolf-mode') || meineTabelle.classList.contains('badminton-mode')) return;
        const tbody = meineTabelle.querySelector('tbody');
        if(tbody && tbody.rows.length > 0) tbody.deleteRow(-1);
    });


    // --- BADMINTON ENGINE ---

    function initBadminton() {
        meineTabelle.innerHTML = '';
        meineTabelle.classList.remove('darts-mode', 'minigolf-mode');
        meineTabelle.classList.add('badminton-mode');

        const spielerAnzahl = parseInt(document.getElementById("badminton-spielerzahl").value) || 2;
        const gewinnSaetze = parseInt(document.getElementById("badminton-saetze").value) || 2;
        const maxSaetze = (gewinnSaetze * 2) - 1;

        let thead = meineTabelle.createTHead();
        let tr = thead.insertRow();
        let thSatz = document.createElement('th'); thSatz.textContent = "Satz"; tr.appendChild(thSatz);

        for(let i=1; i<=spielerAnzahl; i++) {
            let th = document.createElement('th');
            th.textContent = "Spieler " + i; th.contentEditable = "true"; tr.appendChild(th);
        }

        let tbody = meineTabelle.createTBody();
        for(let i=1; i<=maxSaetze; i++) {
            let r = tbody.insertRow();
            let thNr = document.createElement('th'); thNr.textContent = i; r.appendChild(thNr);
            for(let j=1; j<=spielerAnzahl; j++) {
                let c = r.insertCell();
                let input = document.createElement('input');
                input.type = "number"; input.min = "0"; input.max = "30"; input.value = "0";
                input.className = "badminton-input";
                c.appendChild(input);
            }
        }
    }
    if(startBadmintonBtn) startBadmintonBtn.addEventListener('click', initBadminton);

    // --- MINIGOLF ENGINE ---
    function initMinigolf() {
        meineTabelle.innerHTML = '';
        meineTabelle.classList.remove('darts-mode', 'badminton-mode'); 
        meineTabelle.classList.add('minigolf-mode');

        const spielerAnzahl = parseInt(document.getElementById("minigolf-spielerzahl").value) || 2;
        const bahnAnzahl = parseInt(document.getElementById("minigolf-bahnanzahl").value) || 18;

        let thead = meineTabelle.createTHead();
        let tr = thead.insertRow();
        let thBahn = document.createElement('th'); thBahn.textContent = "Bahn"; tr.appendChild(thBahn);

        for(let i=1; i<=spielerAnzahl; i++) {
            let th = document.createElement('th');
            th.innerHTML = `
                <div contentEditable="true">Spieler ${i}</div>
                <div id="minigolf-stats-p${i}" style="font-size:0.75em; margin-top:5px; color:#ea80fc; font-weight:normal; display:none;"></div>
            `;
            tr.appendChild(th);
        }

        let tbody = meineTabelle.createTBody();
        for(let i=1; i<=bahnAnzahl; i++) {
            let r = tbody.insertRow();
            let thNr = document.createElement('th'); 
            thNr.textContent = i; r.appendChild(thNr);

            for(let j=1; j<=spielerAnzahl; j++) {
                let c = r.insertCell();
                c.contentEditable = "true"; c.className = "stp";
                c.setAttribute('data-player-index', j); 
            }
        }

        let footerRow = tbody.insertRow();
        let thSum = document.createElement('td');
        thSum.textContent = "Gesamt"; thSum.className = "gesamt-zelle";
        footerRow.appendChild(thSum);

        for(let i=1; i<=spielerAnzahl; i++) {
            let c = footerRow.insertCell();
            c.textContent = "0"; c.className = "gesamt-zelle";
            c.id = "summe-spieler-" + i; 
        }
        
        if(mgStatsCheckbox && mgStatsCheckbox.checked) updateMinigolfStats();
    }
    if(startMinigolfBtn) startMinigolfBtn.addEventListener('click', initMinigolf);

    // NEU: MINIGOLF STATS RECHNER
    function updateMinigolfStats() {
        const spielerAnzahl = parseInt(document.getElementById("minigolf-spielerzahl").value) || 2;
        const mainCheckbox = document.getElementById('minigolfAdvancedStats');
        if(!mainCheckbox) return;

        if(!mainCheckbox.checked) {
             for(let i=1; i<=spielerAnzahl; i++) {
                 const container = document.getElementById(`minigolf-stats-p${i}`);
                 if(container) container.style.display = 'none';
             }
             return;
        }

        const containerDiv = document.getElementById('minigolf-stats-list');
        const showAvg = containerDiv.querySelector('input[value="avg"]').checked;
        const showHio = containerDiv.querySelector('input[value="hio"]').checked;
        const showBest = containerDiv.querySelector('input[value="best"]').checked;

        for(let i=1; i<=spielerAnzahl; i++) {
            const container = document.getElementById(`minigolf-stats-p${i}`);
            if(!container) continue;
            container.style.display = 'block';

            const zellen = document.querySelectorAll(`.stp[data-player-index="${i}"]`);
            let summe = 0, anzahlBahnen = 0, holeInOnes = 0, besterSchlag = 99; 

            zellen.forEach(z => {
                let schlag = parseInt(z.textContent);
                if(!isNaN(schlag)) {
                    summe += schlag; anzahlBahnen++;
                    if(schlag === 1) holeInOnes++;
                    if(schlag < besterSchlag) besterSchlag = schlag;
                }
            });

            let schnitt = anzahlBahnen > 0 ? (summe / anzahlBahnen).toFixed(2) : "-";
            if(anzahlBahnen === 0) besterSchlag = "-";

            let htmlOutput = "";
            if(showAvg)  htmlOutput += `<div>Ø: ${schnitt}</div>`;
            if(showHio)  htmlOutput += `<div>Hole-in-Ones: ${holeInOnes}</div>`;
            if(showBest) htmlOutput += `<div>Bester: ${besterSchlag}</div>`;
            container.innerHTML = htmlOutput;
        }
    }


    // --- DARTS ENGINE ---
    function initDarts() {
        meineTabelle.innerHTML = '';
        meineTabelle.classList.add('darts-mode');
        meineTabelle.classList.remove('minigolf-mode', 'badminton-mode');

        const spielerAnzahl = parseInt(document.getElementById('darts-spielerzahl').value) || 2;
        const startPunkte = parseInt(document.getElementById('darts-modus').value) || 501;

        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        for(let i=1; i<=spielerAnzahl; i++) {
            const th = document.createElement('th');
            th.innerHTML = `
                <div contenteditable="true">SPIELER ${i}</div>
                <div style="font-size:0.8em; margin-top:5px; font-weight:normal;">
                    SETS: <span id="sets-p${i}">0</span> | LEGS: <span id="legs-p${i}">0</span>
                </div>
                <div id="stats-container-p${i}" style="font-size:0.7em; margin-top:5px; color:#ea80fc;"></div>
            `;
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        meineTabelle.appendChild(thead);

        const tbody = document.createElement('tbody');
        const startRow = document.createElement('tr');
        for(let i=1; i<=spielerAnzahl; i++) {
            const td = document.createElement('td');
            td.setAttribute('data-rest', startPunkte);
            td.innerHTML = `<span class="rest-big">${startPunkte}</span>`;
            startRow.appendChild(td);
        }
        tbody.appendChild(startRow);

        neueWurfZeile(tbody, spielerAnzahl);
        meineTabelle.appendChild(tbody);
        if(advancedStatsCheckbox.checked) updateHeaderStats();
    }
    if(startDartsBtn) startDartsBtn.addEventListener('click', initDarts);

    function neueWurfZeile(tbody, spielerAnzahl) {
        const tr = document.createElement('tr');
        for(let i=0; i<spielerAnzahl; i++) {
            const td = document.createElement('td');
            td.contentEditable = "true"; td.className = "wurf-zelle";
            td.setAttribute('data-player-index', i);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        setTimeout(() => {
            const z = tr.querySelector('td');
            if(z) { z.focus(); z.scrollIntoView({behavior: "smooth", block: "center"}); }
        }, 100);
    }

    // Darts Gameplay
    meineTabelle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.classList.contains('wurf-zelle')) {
            e.preventDefault();
            const zelle = e.target;
            const tbody = meineTabelle.querySelector('tbody');
            const playerIndex = parseInt(zelle.getAttribute('data-player-index'));
            const zeile = zelle.parentElement;
            const wurf = parseInt(zelle.textContent);

            if (isNaN(wurf)) return; 
            if (wurf > 180) { alert("Max 180!"); zelle.textContent=""; return; }

            let alterRest = 501;
            let search = zeile.previousElementSibling;
            while (search) {
                const prev = search.cells[playerIndex];
                if (prev && prev.hasAttribute('data-rest')) {
                    alterRest = parseInt(prev.getAttribute('data-rest')); break;
                }
                search = search.previousElementSibling;
            }

            const modus = document.getElementById('darts-modus').value;
            const isDoubleOut = (modus === '501do');
            let neuerRest = alterRest - wurf;
            let bust = false, legWin = false;

            if (isDoubleOut) {
                if (neuerRest <= 1 && neuerRest !== 0) bust = true; 
                if (neuerRest === 0) legWin = true;
            } else {
                if (neuerRest < 0) bust = true;
                if (neuerRest === 0) legWin = true;
            }

            zelle.contentEditable = "false";
            zelle.classList.remove("wurf-zelle");
            zelle.setAttribute('data-thrown', wurf); 

            if (bust) {
                neuerRest = alterRest;
                zelle.innerHTML = `<div class="last-throw" style="text-decoration:line-through; color:red;">${wurf}</div><div class="rest-big">${neuerRest}</div>`;
                zelle.setAttribute('data-valid', 'false'); alert("Überworfen!");
            } else {
                zelle.innerHTML = `<div class="last-throw">${wurf}</div><div class="rest-big">${neuerRest}</div>`;
                zelle.setAttribute('data-valid', 'true');
                if(neuerRest === 0) zelle.setAttribute('data-checkout', 'true');
            }
            zelle.setAttribute('data-rest', neuerRest);

            if(advancedStatsCheckbox.checked) updateHeaderStats();
            if (legWin) {
                zelle.style.backgroundColor = "green"; handleLegWin(playerIndex + 1); return;
            }
            const next = zelle.nextElementSibling;
            if (next) next.focus(); else neueWurfZeile(tbody, zeile.cells.length);
        }
    });

    function clearHeaderStats() {
        const sAnzahl = parseInt(document.getElementById('darts-spielerzahl').value) || 2;
        for(let i=0; i<sAnzahl; i++) {
            const c = document.getElementById(`stats-container-p${i+1}`);
            if(c) c.innerHTML = '';
        }
    }
    function updateHeaderStats() {
        const spielerAnzahl = parseInt(document.getElementById('darts-spielerzahl').value) || 2;
        const tbody = meineTabelle.querySelector('tbody');
        const showAvg = document.querySelector('input[value="avg"]').checked;
        const showHigh = document.querySelector('input[value="highscore"]').checked;
        const show180 = document.querySelector('input[value="180s"]').checked;
        const showCheckout = document.querySelector('input[value="checkout"]').checked;
        const showMissed = document.querySelector('input[value="missed"]').checked;

        for(let i=0; i<spielerAnzahl; i++) {
            const container = document.getElementById(`stats-container-p${i+1}`);
            if(!container) continue;
            const rows = tbody.querySelectorAll('tr');
            let summe = 0, anzahlAufnahmen = 0, highscore = 0, count180 = 0, maxCheckout = 0, missedCount = 0;

            rows.forEach(r => {
                const cell = r.cells[i];
                if(cell && cell.hasAttribute('data-thrown')) {
                    const w = parseInt(cell.getAttribute('data-thrown'));
                    const valid = cell.getAttribute('data-valid') === 'true';
                    const checkout = cell.getAttribute('data-checkout') === 'true';
                    if(valid) {
                        summe += w;
                        if(w > highscore) highscore = w;
                        if(w === 180) count180++;
                        if(checkout && w > maxCheckout) maxCheckout = w;
                    } else { missedCount++; }
                    anzahlAufnahmen++;
                }
            });
            let avg = anzahlAufnahmen > 0 ? (summe / anzahlAufnahmen).toFixed(1) : "0.0";
            let html = "";
            if(showAvg) html += `<div>Ø: ${avg}</div>`;
            if(showHigh) html += `<div>High: ${highscore}</div>`;
            if(show180) html += `<div>180er: ${count180}</div>`;
            if(showCheckout) html += `<div>Check: ${maxCheckout}</div>`;
            if(showMissed) html += `<div>Bust: ${missedCount}</div>`;
            container.innerHTML = html;
        }
    }

    function handleLegWin(pNr) {
        alert(`Spieler ${pNr} gewinnt Leg!`);
        const lSpan = document.getElementById(`legs-p${pNr}`);
        let legs = parseInt(lSpan.textContent) + 1;
        lSpan.textContent = legs;
        
        const needLegs = parseInt(document.getElementById('legs-to-win').value)||3;
        const needSets = parseInt(document.getElementById('sets-to-win').value)||1;
        
        if(legs >= needLegs) {
            alert(`SATZ GEWONNEN!`);
            document.querySelectorAll('[id^="legs-p"]').forEach(e=>e.textContent=0);
            const sSpan = document.getElementById(`sets-p${pNr}`);
            let sets = parseInt(sSpan.textContent)+1;
            sSpan.textContent = sets;
            if(sets >= needSets) { alert(`MATCH GEWONNEN!`); return; }
        }
        
        const tbody = meineTabelle.querySelector('tbody');
        const startP = parseInt(document.getElementById('darts-modus').value)||501;
        const sAnz = parseInt(document.getElementById('darts-spielerzahl').value)||2;
        tbody.innerHTML = '';
        const sr = document.createElement('tr');
        for(let i=0; i<sAnz; i++) {
            const td = document.createElement('td'); 
            td.innerHTML = `<span class="rest-big">${startP}</span>`; 
            td.setAttribute('data-rest', startP); 
            sr.appendChild(td);
        }
        tbody.appendChild(sr);
        neueWurfZeile(tbody, sAnz);
        if(advancedStatsCheckbox.checked) updateHeaderStats(); 
    }
  // --- MOBILE OPTIMIERUNGEN (Final Fix) ---
    
    function checkMobileMenu() {
        if(window.innerWidth <= 768) {
            // Auf Handy: Klasse 'collapsed' hinzufügen, damit es zu ist
            sidebar.classList.add('collapsed');
        } else {
            // Auf Desktop: Klasse entfernen, damit es offen ist
            sidebar.classList.remove('collapsed');
        }
    }

    // Beim Laden der Seite prüfen
    checkMobileMenu();

    // Funktion zum Schließen nach Klick (für die Buttons)
    function autoCloseSidebarOnMobile() {
        if(window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
        }
    }

    // Buttons verknüpfen
    if(erstelleBtn) erstelleBtn.addEventListener('click', autoCloseSidebarOnMobile);
    if(startDartsBtn) startDartsBtn.addEventListener('click', autoCloseSidebarOnMobile);
    if(startMinigolfBtn) startMinigolfBtn.addEventListener('click', autoCloseSidebarOnMobile);
    if(startBadmintonBtn) startBadmintonBtn.addEventListener('click', autoCloseSidebarOnMobile);