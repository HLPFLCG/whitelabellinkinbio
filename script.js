// White-Label Link-in-Bio JavaScript

class LinkInBio {
    constructor() {
        this.data = this.loadData();
        this.init();
    }

    init() {
        this.renderProfile();
        this.renderLinks();
        this.renderSocial();
        this.applyTheme();
        this.setupEventListeners();
    }

    loadData() {
        const defaultData = {
            profile: {
                name: "Your Name",
                bio: "Your professional bio goes here. Tell visitors about yourself and what you do.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
            },
            links: [
                { title: "Website", url: "https://yourwebsite.com", icon: "fas fa-globe" },
                { title: "Portfolio", url: "https://yourportfolio.com", icon: "fas fa-briefcase" },
                { title: "Email", url: "mailto:your@email.com", icon: "fas fa-envelope" }
            ],
            social: [
                { platform: "twitter", url: "https://twitter.com/yourhandle" },
                { platform: "linkedin", url: "https://linkedin.com/in/yourprofile" },
                { platform: "instagram", url: "https://instagram.com/yourhandle" }
            ],
            theme: {
                primaryColor: "#6366f1",
                secondaryColor: "#8b5cf6",
                backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }
        };

        const savedData = localStorage.getItem('linkinbio-data');
        return savedData ? JSON.parse(savedData) : defaultData;
    }

    saveData() {
        localStorage.setItem('linkinbio-data', JSON.stringify(this.data));
    }

    renderProfile() {
        document.getElementById('profile-name').textContent = this.data.profile.name;
        document.getElementById('profile-bio').textContent = this.data.profile.bio;
        document.getElementById('profile-img').src = this.data.profile.image;
        document.title = `${this.data.profile.name} - Connect With Us`;
        
        // Update footer
        document.querySelector('.footer p').textContent = `© 2024 ${this.data.profile.name}. All rights reserved.`;
    }

    renderLinks() {
        const container = document.getElementById('links-container');
        container.innerHTML = '';

        this.data.links.forEach((link, index) => {
            const linkElement = document.createElement('a');
            linkElement.href = link.url;
            linkElement.className = 'link-item';
            linkElement.style.animationDelay = `${index * 0.1}s`;
            linkElement.target = link.url.startsWith('http') ? '_blank' : '_self';
            linkElement.rel = 'noopener noreferrer';
            
            const icon = link.icon || this.getIconForUrl(link.url);
            linkElement.innerHTML = `
                <span>${link.title}</span>
                <i class="${icon}"></i>
            `;

            // Track clicks
            linkElement.addEventListener('click', () => {
                this.trackEvent('link_click', {
                    title: link.title,
                    url: link.url,
                    index: index
                });
            });

            container.appendChild(linkElement);
        });
    }

    renderSocial() {
        const container = document.getElementById('social-container');
        container.innerHTML = '';

        this.data.social.forEach((social, index) => {
            const socialElement = document.createElement('a');
            socialElement.href = social.url;
            socialElement.className = 'social-link';
            socialElement.target = '_blank';
            socialElement.rel = 'noopener noreferrer';
            socialElement.style.animationDelay = `${index * 0.1}s`;

            const icon = this.getSocialIcon(social.platform);
            socialElement.innerHTML = `<i class="${icon}"></i>`;

            // Track social clicks
            socialElement.addEventListener('click', () => {
                this.trackEvent('social_click', {
                    platform: social.platform,
                    url: social.url,
                    index: index
                });
            });

            container.appendChild(socialElement);
        });
    }

    applyTheme() {
        document.documentElement.style.setProperty('--primary-color', this.data.theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', this.data.theme.secondaryColor);
        document.body.style.background = this.data.theme.backgroundColor;
    }

    getIconForUrl(url) {
        if (url.includes('mailto:')) return 'fas fa-envelope';
        if (url.includes('tel:')) return 'fas fa-phone';
        if (url.includes('twitter.com') || url.includes('x.com')) return 'fab fa-twitter';
        if (url.includes('linkedin.com')) return 'fab fa-linkedin';
        if (url.includes('instagram.com')) return 'fab fa-instagram';
        if (url.includes('facebook.com')) return 'fab fa-facebook';
        if (url.includes('youtube.com')) return 'fab fa-youtube';
        if (url.includes('tiktok.com')) return 'fab fa-tiktok';
        if (url.includes('github.com')) return 'fab fa-github';
        if (url.includes('spotify.com')) return 'fab fa-spotify';
        if (url.includes('apple.com')) return 'fab fa-apple';
        if (url.includes('play.google.com')) return 'fab fa-google-play';
        return 'fas fa-link';
    }

    getSocialIcon(platform) {
        const icons = {
            twitter: 'fab fa-twitter',
            linkedin: 'fab fa-linkedin',
            instagram: 'fab fa-instagram',
            facebook: 'fab fa-facebook',
            youtube: 'fab fa-youtube',
            tiktok: 'fab fa-tiktok',
            github: 'fab fa-github',
            website: 'fas fa-globe',
            spotify: 'fab fa-spotify',
            apple: 'fab fa-apple',
            paypal: 'fab fa-paypal',
            cashapp: 'fas fa-dollar-sign',
            venmo: 'fab fa-venmo'
        };
        return icons[platform] || 'fas fa-link';
    }

    setupEventListeners() {
        // Privacy and terms links
        document.getElementById('privacy-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyModal();
        });

        document.getElementById('terms-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showTermsModal();
        });
    }

    trackEvent(eventName, properties) {
        // Simple analytics tracking
        const event = {
            name: eventName,
            properties: properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.log('Event tracked:', event);

        // Send to analytics endpoint if configured
        if (this.data.analyticsEndpoint) {
            fetch(this.data.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            }).catch(err => console.log('Analytics error:', err));
        }

        // Store local analytics
        this.storeEvent(event);
    }

    storeEvent(event) {
        const events = JSON.parse(localStorage.getItem('linkinbio-events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('linkinbio-events', JSON.stringify(events));
    }

    showPrivacyModal() {
        alert('Privacy Policy: This page collects basic analytics data to improve user experience. No personal information is shared with third parties.');
    }

    showTermsModal() {
        alert('Terms of Service: By using this page, you agree to our terms of service and privacy policy.');
    }
}

// Modal functions
function openModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('active');
    populateModal();
}

function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.remove('active');
}

function populateModal() {
    const data = linkInBio.data;
    
    // Populate profile fields
    document.getElementById('edit-name').value = data.profile.name;
    document.getElementById('edit-bio').value = data.profile.bio;
    document.getElementById('edit-profile-img').value = data.profile.image;
    document.getElementById('brand-color').value = data.theme.primaryColor;
    
    // Populate links
    const linksEditor = document.getElementById('links-editor');
    linksEditor.innerHTML = '';
    data.links.forEach(link => {
        addLinkToEditor(link.title, link.url);
    });
    
    // Populate social
    const socialEditor = document.getElementById('social-editor');
    socialEditor.innerHTML = '';
    data.social.forEach(social => {
        addSocialToEditor(social.platform, social.url);
    });
}

function addLink() {
    addLinkToEditor('', '');
}

function addLinkToEditor(title, url) {
    const linksEditor = document.getElementById('links-editor');
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
        <input type="text" placeholder="Title" class="link-title" value="${title}">
        <input type="url" placeholder="URL" class="link-url" value="${url}">
        <button type="button" onclick="removeLink(this)" class="remove-btn">Remove</button>
    `;
    linksEditor.appendChild(linkItem);
}

function removeLink(button) {
    button.parentElement.remove();
}

function addSocial() {
    addSocialToEditor('twitter', '');
}

function addSocialToEditor(platform, url) {
    const socialEditor = document.getElementById('social-editor');
    const socialItem = document.createElement('div');
    socialItem.className = 'social-item';
    socialItem.innerHTML = `
        <select class="social-platform">
            <option value="twitter" ${platform === 'twitter' ? 'selected' : ''}>Twitter</option>
            <option value="linkedin" ${platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
            <option value="instagram" ${platform === 'instagram' ? 'selected' : ''}>Instagram</option>
            <option value="facebook" ${platform === 'facebook' ? 'selected' : ''}>Facebook</option>
            <option value="youtube" ${platform === 'youtube' ? 'selected' : ''}>YouTube</option>
            <option value="tiktok" ${platform === 'tiktok' ? 'selected' : ''}>TikTok</option>
            <option value="github" ${platform === 'github' ? 'selected' : ''}>GitHub</option>
            <option value="website" ${platform === 'website' ? 'selected' : ''}>Website</option>
        </select>
        <input type="url" placeholder="URL" class="social-url" value="${url}">
        <button type="button" onclick="removeSocial(this)" class="remove-btn">Remove</button>
    `;
    socialEditor.appendChild(socialItem);
}

function removeSocial(button) {
    button.parentElement.remove();
}

function saveChanges() {
    const data = linkInBio.data;
    
    // Update profile
    data.profile.name = document.getElementById('edit-name').value || 'Your Name';
    data.profile.bio = document.getElementById('edit-bio').value || 'Your professional bio';
    data.profile.image = document.getElementById('edit-profile-img').value || data.profile.image;
    
    // Update theme
    const primaryColor = document.getElementById('brand-color').value;
    data.theme.primaryColor = primaryColor;
    data.theme.secondaryColor = primaryColor; // Use same color for simplicity
    
    // Update links
    data.links = [];
    document.querySelectorAll('#links-editor .link-item').forEach(item => {
        const title = item.querySelector('.link-title').value;
        const url = item.querySelector('.link-url').value;
        if (title && url) {
            data.links.push({ title, url });
        }
    });
    
    // Update social
    data.social = [];
    document.querySelectorAll('#social-editor .social-item').forEach(item => {
        const platform = item.querySelector('.social-platform').value;
        const url = item.querySelector('.social-url').value;
        if (platform && url) {
            data.social.push({ platform, url });
        }
    });
    
    // Save and re-render
    linkInBio.data = data;
    linkInBio.saveData();
    linkInBio.init();
    
    closeModal();
    
    // Show success message
    showNotification('Changes saved successfully!');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideInUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize the app
let linkInBio;

document.addEventListener('DOMContentLoaded', function() {
    linkInBio = new LinkInBio();
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modal on background click
document.getElementById('edit-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);