// Avatar Editor JavaScript
class AvatarEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.avatarData = {
            selectedParts: {},
            colors: {}
        };
        this.manifest = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('Avatar Editor initializing...');
        
        // Initialize Firebase
        if (!this.initializeFirebase()) {
            console.error('Failed to initialize Firebase');
            return;
        }

        // Check authentication
        this.checkAuthentication();
    }

    initializeFirebase() {
        try {
            if (!firebaseApp) {
                firebaseApp = firebase.initializeApp(CONFIG.firebase);
                firebaseAuth = firebase.auth();
                firebaseDatabase = firebase.database();
                console.log('Firebase initialized successfully');
            }
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            return false;
        }
    }

    checkAuthentication() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                console.log('User authenticated:', user.email);
                this.setupEditor();
            } else {
                console.log('No authenticated user, redirecting...');
                window.location.href = 'auth.html';
            }
        });
    }

    async setupEditor() {
        console.log('Setting up avatar editor...');
        
        // Load manifest
        await this.loadManifest();
        
        // Setup canvas
        this.setupCanvas();
        
        // Setup UI
        this.setupUI();
        
        // Load user's existing avatar if any
        await this.loadUserAvatar();
        
        // Render initial avatar
        this.renderAvatar();
    }

    async loadManifest() {
        try {
            const response = await fetch('avatars/manifest.json');
            this.manifest = await response.json();
            console.log('Manifest loaded:', this.manifest);
        } catch (error) {
            console.error('Error loading manifest:', error);
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('avatar-canvas');
        if (!this.canvas) {
            console.error('Avatar canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
    }

    setupUI() {
        // Create category buttons
        const categories = Object.keys(this.manifest);
        const categoryContainer = document.getElementById('category-buttons');
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            button.className = 'category-btn';
            button.dataset.category = category;
            button.addEventListener('click', () => this.selectCategory(category));
            categoryContainer.appendChild(button);
        });

        // Setup color pickers
        this.setupColorPickers();

        // Setup save button
        const saveBtn = document.getElementById('save-avatar');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAvatar());
        }
    }

    setupColorPickers() {
        const colorContainer = document.getElementById('color-pickers');
        if (!colorContainer) return;

        // Add color pickers for different parts
        const colorableParts = ['hair', 'eyes', 'mouths', 'tops'];
        
        colorableParts.forEach(part => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-picker-group';
            
            const label = document.createElement('label');
            label.textContent = part.charAt(0).toUpperCase() + part.slice(1) + ' Color:';
            
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.id = `${part}-color`;
            colorInput.value = '#000000';
            colorInput.addEventListener('change', (e) => {
                this.avatarData.colors[part] = e.target.value;
                this.renderAvatar();
            });
            
            colorDiv.appendChild(label);
            colorDiv.appendChild(colorInput);
            colorContainer.appendChild(colorDiv);
        });
    }

    selectCategory(category) {
        console.log('Selected category:', category);
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Show items for this category
        this.showCategoryItems(category);
    }

    showCategoryItems(category) {
        const itemsContainer = document.getElementById('items-container');
        if (!itemsContainer) return;
        
        itemsContainer.innerHTML = '';
        
        const items = this.manifest[category];
        if (!items) return;
        
        // Filter out overlay files
        const mainItems = items.filter(item => !item.includes('overlay'));
        
        mainItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-option';
            
            const img = document.createElement('img');
            img.src = `avatars/${category}/${item}`;
            img.alt = item;
            img.title = item.replace('.png', '');
            
            img.addEventListener('click', () => {
                this.selectItem(category, item);
            });
            
            itemDiv.appendChild(img);
            itemsContainer.appendChild(itemDiv);
        });
    }

    selectItem(category, item) {
        console.log('Selected item:', category, item);
        
        // Update selected parts
        this.avatarData.selectedParts[category] = item;
        
        // Update visual selection
        document.querySelectorAll('.item-option').forEach(div => {
            div.classList.remove('selected');
        });
        event.target.parentElement.classList.add('selected');
        
        // Re-render avatar
        this.renderAvatar();
    }

    renderAvatar() {
        if (!this.ctx || !this.manifest) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set canvas size
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // Draw background
        this.drawBackground();
        
        // Draw avatar parts in order
        const drawOrder = ['backgrounds', 'bases', 'hair', 'eyes', 'brows', 'noses', 'mouths', 'glasses', 'hats', 'tops', 'neck'];
        
        drawOrder.forEach(category => {
            const selectedItem = this.avatarData.selectedParts[category];
            if (selectedItem) {
                this.drawAvatarPart(category, selectedItem);
            }
        });
    }

    drawBackground() {
        // Draw a simple gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#E3F2FD');
        gradient.addColorStop(1, '#BBDEFB');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async drawAvatarPart(category, item) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Apply color if this part has a color
                if (this.avatarData.colors[category]) {
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    
                    // Apply color overlay
                    this.ctx.globalCompositeOperation = 'multiply';
                    this.ctx.fillStyle = this.avatarData.colors[category];
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.globalCompositeOperation = 'source-over';
                } else {
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                }
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load image: avatars/${category}/${item}`);
                resolve();
            };
            img.src = `avatars/${category}/${item}`;
        });
    }

    async loadUserAvatar() {
        if (!this.currentUser) return;
        
        try {
            const userRef = firebaseDatabase.ref(`users/${this.currentUser.uid}`);
            const snapshot = await userRef.once('value');
            const userData = snapshot.val();
            
            if (userData && userData.avatar) {
                this.avatarData = userData.avatar;
                console.log('Loaded user avatar:', this.avatarData);
                
                // Update UI to reflect loaded avatar
                this.updateUIFromAvatarData();
            }
        } catch (error) {
            console.error('Error loading user avatar:', error);
        }
    }

    updateUIFromAvatarData() {
        // Update color pickers
        Object.entries(this.avatarData.colors || {}).forEach(([part, color]) => {
            const colorInput = document.getElementById(`${part}-color`);
            if (colorInput) {
                colorInput.value = color;
            }
        });
        
        // Select first category to show items
        const firstCategory = Object.keys(this.manifest)[0];
        if (firstCategory) {
            this.selectCategory(firstCategory);
        }
    }

    async saveAvatar() {
        if (!this.currentUser) {
            console.error('No authenticated user');
            return;
        }
        
        try {
            console.log('Saving avatar...');
            
            // Generate WebP image
            const webpDataUrl = await this.generateWebP();
            
            // Save to Firebase
            const userRef = firebaseDatabase.ref(`users/${this.currentUser.uid}`);
            await userRef.update({
                avatar: this.avatarData,
                avatarImage: webpDataUrl,
                avatarUpdated: Date.now()
            });
            
            console.log('Avatar saved successfully!');
            alert('Avatar saved successfully!');
            
            // Redirect back to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('Error saving avatar:', error);
            alert('Error saving avatar. Please try again.');
        }
    }

    async generateWebP() {
        return new Promise((resolve) => {
            // Create a temporary canvas for WebP generation
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 400;
            tempCanvas.height = 400;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw the avatar on temp canvas
            this.drawAvatarOnCanvas(tempCtx, tempCanvas.width, tempCanvas.height);
            
            // Convert to WebP
            tempCanvas.toBlob((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(blob);
            }, 'image/webp', 0.9);
        });
    }

    drawAvatarOnCanvas(ctx, width, height) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#E3F2FD');
        gradient.addColorStop(1, '#BBDEFB');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw avatar parts in order
        const drawOrder = ['backgrounds', 'bases', 'hair', 'eyes', 'brows', 'noses', 'mouths', 'glasses', 'hats', 'tops', 'neck'];
        
        drawOrder.forEach(category => {
            const selectedItem = this.avatarData.selectedParts[category];
            if (selectedItem) {
                this.drawAvatarPartOnCanvas(ctx, category, selectedItem, width, height);
            }
        });
    }

    async drawAvatarPartOnCanvas(ctx, category, item, width, height) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Apply color if this part has a color
                if (this.avatarData.colors[category]) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Apply color overlay
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = this.avatarData.colors[category];
                    ctx.fillRect(0, 0, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                } else {
                    ctx.drawImage(img, 0, 0, width, height);
                }
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load image: avatars/${category}/${item}`);
                resolve();
            };
            img.src = `avatars/${category}/${item}`;
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AvatarEditor();
});
