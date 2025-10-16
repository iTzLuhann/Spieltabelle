const erstelleBtn = document.getElementById('createTable');
const meineTabelle = document.getElementById('tableContainer');

function tabelleErstellen() {
    const spielerInput = document.getElementById('spielerzahl');
    const spielInput = document.getElementById('spielanzahl');

    const spielerAnzahl = parseInt(spielerInput.value, 10);
    const spielAnzahl = parseInt(spielInput.value, 10);

    if (isNaN(spielerAnzahl) || isNaN(spielAnzahl) || spielerAnzahl <= 0 || spielAnzahl <= 0) {
        alert("Bitte gib gültige Zahlen für Spieler und Spiele ein.");
        return;
    }

    // Alte Tabelle entfernen
    meineTabelle.innerHTML = '';

    // Tabellenkopf erstellen
    let thead = meineTabelle.createTHead();
    let kopfzeile = thead.insertRow();

    let thspieler = document.createElement('th');
    thspieler.textContent = 'Spieler';
    kopfzeile.appendChild(thspieler);

    for (let i = 1; i <= spielAnzahl; i++) {
        let th = document.createElement('th');
        th.textContent = `Spiel ` + i;
        th.contentEditable = 'true';
        kopfzeile.appendChild(th);
    }
    
    // Kopfzelle für die Gesamtpunktzahl
    let thGesamt = document.createElement('th');
    thGesamt.textContent = 'Gesamt';
    kopfzeile.appendChild(thGesamt);


    // Tabellenkörper erstellen
    let tbody = meineTabelle.createTBody();
    for (let i = 1; i <= spielerAnzahl; i++) {
        let spielerZeile = tbody.insertRow();
        
        let nameZelle = spielerZeile.insertCell();
        nameZelle.textContent = 'Spieler ' + i;
        nameZelle.contentEditable = 'true';

        for (let j = 1; j <= spielAnzahl; j++) {
            let punktZelle = spielerZeile.insertCell();
            punktZelle.contentEditable = 'true';
            punktZelle.className = 'punkt-zelle'; // Klasse für Punktezellen
        }

        let gesamtZelle = spielerZeile.insertCell();
        gesamtZelle.textContent = '0';
        gesamtZelle.className = 'gesamt-zelle'; // Klasse für die Ergebniszelle
    }
}

// Event Listener, der die Tabellenerstellung auslöst
erstelleBtn.addEventListener('click', tabelleErstellen);


// Event Listener für die automatische Summenberechnung
meineTabelle.addEventListener('input', function(event) {
    if (event.target.classList.contains('punkt-zelle')) {
        const zeile = event.target.parentElement;
        const punktZellen = zeile.querySelectorAll('.punkt-zelle');
        const gesamtZelle = zeile.querySelector('.gesamt-zelle');
        
        let summe = 0;
        punktZellen.forEach(zelle => {
            const wert = parseInt(zelle.textContent) || 0;
            summe += wert;
        });
        
        gesamtZelle.textContent = summe;
    }
});