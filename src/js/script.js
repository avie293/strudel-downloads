async function fetchServerStatuses() {
    const serverCards = document.querySelectorAll('.server-card');
    
    serverCards.forEach(async (card) => {
        
        const ip = card.getAttribute('data-ip');
        const ipText = card.querySelector('.ip-text');
        if (ip && ipText) {
            ipText.textContent = ip;
        }

        const isArchived = card.getAttribute('data-archived') === 'true';
        const statusBadge = card.querySelector('.server-status-badge');
        const playerCount = card.querySelector('.player-count');
        const iconImg = card.querySelector('.server-icon');
        const motdElement = card.querySelector('.server-motd');

        if (isArchived) {
            card.classList.add('archived');
            
            if (statusBadge) {
                statusBadge.textContent = "Archiviert";
                statusBadge.className = "server-status-badge status-archived";
            }
            
            const archiveDate = card.getAttribute('data-archive-date');
            if (archiveDate && playerCount) {
                playerCount.textContent = `Archiviert am: ${archiveDate}`;
            }

            if (iconImg) {
                iconImg.src = "src/assets/archiv.svg";
            }

            if (motdElement) {
                motdElement.textContent = "Archivierter Server";
            }

            return; 
        }

        if (!ip) return;

        const serverVersion = card.querySelector('.server-version');

        try {
            const response = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
            const data = await response.json();

            if (data.online) {
                statusBadge.textContent = "Online";
                statusBadge.className = "server-status-badge status-online";
                playerCount.textContent = `Spieler: ${data.players.online}/${data.players.max}`;
                
                if (motdElement && data.motd && data.motd.clean) {
                    motdElement.textContent = data.motd.clean.join(' ');
                }
                
                if (data.version) {
                    serverVersion.textContent = data.version;
                }
                
                if (data.icon) {
                    iconImg.src = data.icon;
                } else {
                    iconImg.src = "src/assets/archiv.svg";
                }
            } else {
                statusBadge.textContent = "Offline";
                statusBadge.className = "server-status-badge status-offline";
                playerCount.textContent = "Spieler: 0/0";
                iconImg.src = "src/assets/archiv.svg";
                
                if (motdElement) {
                    motdElement.textContent = "Can't connect to server";
                }
            }
        } catch (error) {
            statusBadge.textContent = "Fehler";
            statusBadge.className = "server-status-badge status-offline";
        }
    });
}

function switchTab(tabId, buttonElement) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    
    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

function copyIp(button) {
    const ipBox = button.parentElement.querySelector('.ip-text');
    if (!ipBox) {
        console.error("IP-Textfeld nicht gefunden!");
        return;
    }
    
    const textToCopy = ipBox.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.warn("Clipboard API fehlgeschlagen, nutze Fallback:", err);
            fallbackCopyText(textToCopy, button);
        });
    } else {
        fallbackCopyText(textToCopy, button);
    }
}

function fallbackCopyText(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            alert('Kopieren fehlgeschlagen.');
        }
    } catch (err) {
        console.error('Fehler beim Ausführen des Fallbacks:', err);
    }

    document.body.removeChild(textArea);
}

function showCopySuccess(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-check"></i> Kopiert!';
    setTimeout(() => {
        button.innerHTML = originalContent;
    }, 2000);
}

async function fetchDiscordWidget() {
    const widgetCard = document.getElementById('discord-widget');
    if (!widgetCard) return;

    const serverId = widgetCard.getAttribute('data-server-id');
    const onlineCountSpan = document.getElementById('discord-online-count');
    const serverNameH3 = document.getElementById('discord-server-name');
    const membersListContainer = document.getElementById('discord-members-list');

    try {
        const response = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        const data = await response.json();

        if (data) {
            if (serverNameH3 && data.name) serverNameH3.textContent = data.name;
            if (onlineCountSpan) onlineCountSpan.textContent = data.presence_count || 0;

            if (membersListContainer && data.members) {
                membersListContainer.innerHTML = ""; 
                
                const onlineMembers = data.members.slice(0, 100000);

                if (onlineMembers.length === 0) {
                    membersListContainer.innerHTML = '<div class="no-members">Keine Mitglieder online</div>';
                } else {
                    onlineMembers.forEach(member => {
                        const memberRow = document.createElement('div');
                        memberRow.className = 'discord-member-item';
                        
                        const avatarUrl = member.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";
                        
                        let activityText = "";
                        if (member.game && member.game.name) {
                            activityText = `<span class="member-activity">Spielt ${member.game.name}</span>`;
                        }

                        const memberStatus = member.status ? member.status : 'online';

                        memberRow.innerHTML = `
                            <div class="member-avatar-wrapper">
                                <img src="${avatarUrl}" alt="${member.username}" class="member-avatar">
                                <span class="member-status-indicator status-${memberStatus}"></span>
                            </div>
                            <div class="member-info">
                                <span class="member-name">${member.username}</span>
                                ${activityText}
                            </div>
                        `;
                        membersListContainer.appendChild(memberRow);
                    });
                }
            }
        }
    } catch (error) {
        console.error("Fehler beim Laden des Discord-Widgets:", error);
    }
}

const totalScreenshots = 46; 
let currentScreenshotIndex = 0;

function initScreenshotsGallery() {
    const gridContainer = document.getElementById('screenshots-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';

    for (let i = 1; i <= totalScreenshots; i++) {
        const imagePath = `src/assets/screenshots/${i}.png`;

        const card = document.createElement('div');
        card.className = 'card screenshot-card';
        card.setAttribute('onclick', `openLightbox(${i - 1})`);

        card.innerHTML = `
            <img src="${imagePath}" alt="Screenshot ${i}" loading="lazy" onerror="this.closest('.screenshot-card').style.display='none'">
            <div class="screenshot-overlay">
                <span class="screenshot-number">#${i}</span>
                <a href="${imagePath}" class="ui-action-btn" download onclick="event.stopPropagation()">
                    <i class="fa-solid fa-download"></i>
                </a>
            </div>
        `;

        gridContainer.appendChild(card);
    }
}

function getScreenshotElements() {
    return document.querySelectorAll('.screenshot-card:not([style*="display: none"]) img');
}

function openLightbox(index) {
    const images = getScreenshotElements();
    if (images.length === 0) return;

    currentScreenshotIndex = index;
    updateLightboxContent();
    
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox(event) {
    if (event.target.id === 'lightbox') {
        closeLightboxDirect();
    }
}

function closeLightboxDirect() {
    document.getElementById('lightbox').classList.remove('active');
}

let slideDirection = 'right';

function changeSlide(direction) {
    const images = getScreenshotElements();
    if (images.length === 0) return;

    slideDirection = direction > 0 ? 'right' : 'left';

    currentScreenshotIndex += direction;

    if (currentScreenshotIndex >= images.length) {
        currentScreenshotIndex = 0;
    } else if (currentScreenshotIndex < 0) {
        currentScreenshotIndex = images.length - 1;
    }

    updateLightboxContent();
}

function updateLightboxContent() {
    const images = getScreenshotElements();
    if (images.length === 0) return;

    if (currentScreenshotIndex >= images.length) currentScreenshotIndex = 0;
    if (currentScreenshotIndex < 0) currentScreenshotIndex = images.length - 1;

    const currentImg = images[currentScreenshotIndex];
    if (!currentImg) return;
    
    const imgSrc = currentImg.src;
    const imgElement = document.getElementById('lightbox-img');

    imgElement.src = imgSrc;
    document.getElementById('lightbox-download').href = imgSrc;
    
    imgElement.classList.remove('slide-right', 'slide-left');
    void imgElement.offsetWidth;
    imgElement.classList.add(slideDirection === 'right' ? 'slide-right' : 'slide-left');
    
    const counterElement = document.getElementById('lightbox-counter');
    const imageContainer = document.querySelector('.lightbox-image-container');
    
    if (counterElement) {
        counterElement.textContent = `${currentScreenshotIndex + 1} / ${images.length}`;
    }

    if (imageContainer) {
        imageContainer.classList.add('flash-counter');
        
        clearTimeout(window.flashTimeout);
        window.flashTimeout = setTimeout(() => {
            imageContainer.classList.remove('flash-counter');
        }, 1200);
    }
}

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closeLightboxDirect();
    }else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        changeSlide(1);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initScreenshotsGallery();
});

fetchServerStatuses();
setInterval(fetchServerStatuses, 2000);

fetchDiscordWidget();
setInterval(fetchDiscordWidget, 2000);
