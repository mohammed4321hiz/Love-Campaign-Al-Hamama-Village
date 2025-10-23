// نظام إدارة التبرعات المتكامل مع 3 عملات
class AdvancedDonationSystem {
    constructor() {
        this.donations = this.loadDonations();
        this.exchangeRates = this.loadExchangeRates();
        this.selectedDonations = new Set();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.initParticles();
        this.initEventListeners();
        
        if (window.location.pathname.includes('admin.html')) {
            this.initAdminPanel();
        } else {
            this.initDisplay();
        }
        
        this.updateAllDisplays();
        
        // تحديث تلقائي كل 5 ثواني
        setInterval(() => {
            this.updateAllDisplays();
        }, 5000);
    }

    // جسيمات الخلفية
    initParticles() {
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#ffffff" },
                    shape: { type: "circle" },
                    opacity: { value: 0.2, random: true },
                    size: { value: 3, random: true },
                    line_linked: { enable: false },
                    move: { 
                        enable: true, 
                        speed: 1, 
                        direction: "none", 
                        random: true, 
                        out_mode: "out" 
                    }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: {
                        onhover: { enable: true, mode: "repulse" },
                        onclick: { enable: true, mode: "push" }
                    }
                }
            });
        }
    }

    // تحميل أسعار الصرف
    loadExchangeRates() {
        try {
            const saved = localStorage.getItem('exchangeRates');
            const defaultRates = {
                USD: 1,
                TRY: 50,    // 1 USD = 50 TRY
                SYP: 5000   // 1 USD = 5000 SYP
            };
            return saved ? JSON.parse(saved) : defaultRates;
        } catch (error) {
            console.error('خطأ في تحميل أسعار الصرف:', error);
            return { USD: 1, TRY: 50, SYP: 5000 };
        }
    }

    saveExchangeRates() {
        try {
            localStorage.setItem('exchangeRates', JSON.stringify(this.exchangeRates));
            return true;
        } catch (error) {
            console.error('خطأ في حفظ أسعار الصرف:', error);
            return false;
        }
    }

    // تحميل التبرعات
    loadDonations() {
        try {
            const saved = localStorage.getItem('multiCurrencyDonations');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showAlert('خطأ في تحميل البيانات', 'error');
            return [];
        }
    }

    // حفظ التبرعات
    saveDonations() {
        try {
            localStorage.setItem('multiCurrencyDonations', JSON.stringify(this.donations));
            this.triggerDataUpdate();
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            this.showAlert('خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    // إضافة تبرع جديد
    addDonation(name, amount, currency) {
        try {
            if (!name || !name.trim()) {
                this.showAlert('يرجى إدخال اسم المتبرع', 'error');
                return false;
            }

            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                this.showAlert('يرجى إدخال مبلغ صحيح', 'error');
                return false;
            }

            if (!['USD', 'TRY', 'SYP'].includes(currency)) {
                this.showAlert('يرجى اختيار عملة صحيحة', 'error');
                return false;
            }

            const donation = {
                id: Date.now() + Math.random(),
                name: name.trim(),
                amount: parseFloat(parseFloat(amount).toFixed(2)),
                currency: currency,
                time: new Date().toLocaleTimeString('ar-EG'),
                date: new Date().toISOString(),
                timestamp: Date.now()
            };

            this.donations.unshift(donation);
            
            if (this.saveDonations()) {
                const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };
                this.showAlert(`تم إضافة تبرع ${donation.amount}${currencySymbols[currency]} من ${donation.name}`);
                this.updateAllDisplays();
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('خطأ في إضافة التبرع:', error);
            this.showAlert('خطأ في إضافة التبرع', 'error');
            return false;
        }
    }

    // تعديل تبرع
    editDonation(id, newName, newAmount, newCurrency) {
        try {
            const donationIndex = this.donations.findIndex(d => d.id === id);
            if (donationIndex === -1) {
                this.showAlert('التبرع غير موجود', 'error');
                return false;
            }

            if (!newName || !newName.trim()) {
                this.showAlert('يرجى إدخال اسم المتبرع', 'error');
                return false;
            }

            if (!newAmount || isNaN(newAmount) || parseFloat(newAmount) <= 0) {
                this.showAlert('يرجى إدخال مبلغ صحيح', 'error');
                return false;
            }

            if (!['USD', 'TRY', 'SYP'].includes(newCurrency)) {
                this.showAlert('يرجى اختيار عملة صحيحة', 'error');
                return false;
            }

            this.donations[donationIndex] = {
                ...this.donations[donationIndex],
                name: newName.trim(),
                amount: parseFloat(parseFloat(newAmount).toFixed(2)),
                currency: newCurrency,
                time: new Date().toLocaleTimeString('ar-EG')
            };

            if (this.saveDonations()) {
                this.showAlert('تم تعديل التبرع بنجاح');
                this.updateAllDisplays();
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('خطأ في تعديل التبرع:', error);
            this.showAlert('خطأ في تعديل التبرع', 'error');
            return false;
        }
    }

    // حذف تبرع
    deleteDonation(id) {
        try {
            this.donations = this.donations.filter(d => d.id !== id);
            
            if (this.saveDonations()) {
                this.showAlert('تم حذف التبرع بنجاح');
                this.updateAllDisplays();
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('خطأ في حذف التبرع:', error);
            this.showAlert('خطأ في حذف التبرع', 'error');
            return false;
        }
    }

    // حذف تبرعات محددة
    deleteSelectedDonations() {
        try {
            if (this.selectedDonations.size === 0) {
                this.showAlert('لم تقم بتحديد أي تبرعات', 'warning');
                return false;
            }

            if (!confirm(`هل أنت متأكد من حذف ${this.selectedDonations.size} تبرع؟`)) {
                return false;
            }

            this.donations = this.donations.filter(d => !this.selectedDonations.has(d.id));
            this.selectedDonations.clear();
            
            if (this.saveDonations()) {
                this.showAlert(`تم حذف ${this.selectedDonations.size} تبرع`);
                this.updateAllDisplays();
                return true;
            }
            
            return false;

        } catch (error) {
            console.error('خطأ في حذف التبرعات المحددة:', error);
            this.showAlert('خطأ في حذف التبرعات المحددة', 'error');
            return false;
        }
    }

    // تحويل العملات
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;
        
        // تحويل إلى USD أولاً
        let amountInUSD = amount / this.exchangeRates[fromCurrency];
        
        // ثم تحويل من USD إلى العملة المطلوبة
        return amountInUSD * this.exchangeRates[toCurrency];
    }

    // تحديث جميع العروض
    updateAllDisplays() {
        try {
            this.updateDonationsList();
            this.updateTotalAmounts();
            this.updateTopDonations();
            this.updateRecentDonations();
            this.updateManagementList();
            this.updateStats();
            this.updateExchangeRatesDisplay();
            this.updateLastUpdateTime();
            this.updateSidebar(); // إضافة تحديث القائمة الجانبية
        } catch (error) {
            console.error('خطأ في تحديث العروض:', error);
        }
    }

    // تحديث قائمة التبرعات
    updateDonationsList() {
        try {
            const list = document.getElementById('donationsList');
            if (!list) return;

            if (this.donations.length === 0) {
                list.innerHTML = '<div class="empty-state">لا توجد تبرعات حتى الآن</div>';
                return;
            }

            const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };
            
            list.innerHTML = this.donations.slice(0, 10).map(donation => `
                <div class="donation-item">
                    <div class="donor-name">${this.escapeHtml(donation.name)}</div>
                    <div class="donation-amount ${donation.currency.toLowerCase()}">
                        ${donation.amount.toLocaleString()}${currencySymbols[donation.currency]}
                    </div>
                    <div class="donation-time">${donation.time}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('خطأ في تحديث قائمة التبرعات:', error);
        }
    }

    // تحديث الإجمالي للعملات الثلاث
    updateTotalAmounts() {
        try {
            // حساب الإجمالي لكل عملة
            const totals = {
                USD: 0,
                TRY: 0,
                SYP: 0
            };

            this.donations.forEach(donation => {
                totals[donation.currency] += donation.amount;
            });

            // تحديث عرض الإجمالي
            const totalUSDElement = document.getElementById('totalUSD');
            const totalTRYElement = document.getElementById('totalTRY');
            const totalSYPElement = document.getElementById('totalSYP');

            if (totalUSDElement) totalUSDElement.textContent = totals.USD.toLocaleString();
            if (totalTRYElement) totalTRYElement.textContent = totals.TRY.toLocaleString();
            if (totalSYPElement) totalSYPElement.textContent = totals.SYP.toLocaleString();

            // تحديث الإجمالي في لوحة التحكم
            const breakdownUSDElement = document.getElementById('breakdownUSD');
            const breakdownTRYElement = document.getElementById('breakdownTRY');
            const breakdownSYPElement = document.getElementById('breakdownSYP');

            if (breakdownUSDElement) breakdownUSDElement.textContent = `${totals.USD.toLocaleString()}$`;
            if (breakdownTRYElement) breakdownTRYElement.textContent = `${totals.TRY.toLocaleString()}₺`;
            if (breakdownSYPElement) breakdownSYPElement.textContent = `${totals.SYP.toLocaleString()}ل.س`;

        } catch (error) {
            console.error('خطأ في تحديث الإجمالي:', error);
        }
    }

    // تحديث أعلى التبرعات لكل عملة
    updateTopDonations() {
        try {
            const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };
            
            // أعلى تبرعات USD
            const topUSD = this.donations
                .filter(d => d.currency === 'USD')
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            
            const topUSDList = document.getElementById('topUSDList');
            if (topUSDList) {
                topUSDList.innerHTML = topUSD.map(donation => `
                    <div class="top-item">
                        <span class="top-donor">${this.escapeHtml(donation.name)}</span>
                        <span class="top-amount usd">${donation.amount.toLocaleString()}$</span>
                    </div>
                `).join('');
            }

            // أعلى تبرعات TRY
            const topTRY = this.donations
                .filter(d => d.currency === 'TRY')
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            
            const topTRYList = document.getElementById('topTRYList');
            if (topTRYList) {
                topTRYList.innerHTML = topTRY.map(donation => `
                    <div class="top-item">
                        <span class="top-donor">${this.escapeHtml(donation.name)}</span>
                        <span class="top-amount try">${donation.amount.toLocaleString()}₺</span>
                    </div>
                `).join('');
            }

            // أعلى تبرعات SYP
            const topSYP = this.donations
                .filter(d => d.currency === 'SYP')
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
            
            const topSYPList = document.getElementById('topSYPList');
            if (topSYPList) {
                topSYPList.innerHTML = topSYP.map(donation => `
                    <div class="top-item">
                        <span class="top-donor">${this.escapeHtml(donation.name)}</span>
                        <span class="top-amount syp">${donation.amount.toLocaleString()}ل.س</span>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('خطأ في تحديث أعلى التبرعات:', error);
        }
    }

    // تحديث قائمة الإدارة
    updateManagementList() {
        try {
            const list = document.getElementById('donationsManagement');
            if (!list) return;

            if (this.donations.length === 0) {
                list.innerHTML = '<div class="empty-state">لا توجد تبرعات لإدارتها</div>';
                return;
            }

            const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };
            const currencyFilter = document.getElementById('currencyFilter')?.value || 'all';

            const filteredDonations = currencyFilter === 'all' 
                ? this.donations 
                : this.donations.filter(d => d.currency === currencyFilter);

            list.innerHTML = filteredDonations.map(donation => `
                <div class="managed-donation ${this.selectedDonations.has(donation.id) ? 'selected' : ''}" data-id="${donation.id}">
                    <div class="donation-info">
                        <div class="donor-name">${this.escapeHtml(donation.name)}</div>
                        <div class="donation-amount ${donation.currency.toLowerCase()}">
                            ${donation.amount.toLocaleString()}${currencySymbols[donation.currency]}
                        </div>
                        <div class="donation-time">${donation.time}</div>
                    </div>
                    <div class="donation-actions">
                        <button class="select-btn" onclick="donationSystem.toggleSelection(${donation.id})">
                            ${this.selectedDonations.has(donation.id) ? '❌' : '✅'}
                        </button>
                        <button class="edit-btn" onclick="donationSystem.openEditModal(${donation.id})">تعديل</button>
                        <button class="delete-btn" onclick="donationSystem.deleteDonation(${donation.id})">حذف</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('خطأ في تحديث قائمة الإدارة:', error);
        }
    }

    // تحديث الإحصائيات
    updateStats() {
        try {
            // الإحصائيات العامة
            const totalDonationsElement = document.getElementById('totalDonations');
            const totalDonorsElement = document.getElementById('totalDonors');
            const todayDonationsElement = document.getElementById('todayDonations');

            if (totalDonationsElement) totalDonationsElement.textContent = this.donations.length.toLocaleString();
            if (totalDonorsElement) totalDonorsElement.textContent = new Set(this.donations.map(d => d.name)).size.toLocaleString();
            
            if (todayDonationsElement) {
                const today = new Date().toDateString();
                const todayDonations = this.donations.filter(d => 
                    new Date(d.date).toDateString() === today
                );
                todayDonationsElement.textContent = todayDonations.length.toLocaleString();
            }

            // الإحصائيات حسب العملة
            const usdDonations = this.donations.filter(d => d.currency === 'USD');
            const tryDonations = this.donations.filter(d => d.currency === 'TRY');
            const sypDonations = this.donations.filter(d => d.currency === 'SYP');

            // تحديث إحصائيات USD
            const statsUSDElement = document.getElementById('statsUSD');
            const countUSDElement = document.getElementById('countUSD');
            const maxUSDElement = document.getElementById('maxUSD');

            if (statsUSDElement) statsUSDElement.textContent = `${usdDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}$`;
            if (countUSDElement) countUSDElement.textContent = usdDonations.length.toLocaleString();
            if (maxUSDElement) maxUSDElement.textContent = `${(usdDonations.length > 0 ? Math.max(...usdDonations.map(d => d.amount)) : 0).toLocaleString()}$`;

            // تحديث إحصائيات TRY
            const statsTRYElement = document.getElementById('statsTRY');
            const countTRYElement = document.getElementById('countTRY');
            const maxTRYElement = document.getElementById('maxTRY');

            if (statsTRYElement) statsTRYElement.textContent = `${tryDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}₺`;
            if (countTRYElement) countTRYElement.textContent = tryDonations.length.toLocaleString();
            if (maxTRYElement) maxTRYElement.textContent = `${(tryDonations.length > 0 ? Math.max(...tryDonations.map(d => d.amount)) : 0).toLocaleString()}₺`;

            // تحديث إحصائيات SYP
            const statsSYPElement = document.getElementById('statsSYP');
            const countSYPElement = document.getElementById('countSYP');
            const maxSYPElement = document.getElementById('maxSYP');

            if (statsSYPElement) statsSYPElement.textContent = `${sypDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}ل.س`;
            if (countSYPElement) countSYPElement.textContent = sypDonations.length.toLocaleString();
            if (maxSYPElement) maxSYPElement.textContent = `${(sypDonations.length > 0 ? Math.max(...sypDonations.map(d => d.amount)) : 0).toLocaleString()}ل.س`;

        } catch (error) {
            console.error('خطأ في تحديث الإحصائيات:', error);
        }
    }

    // تحديث عرض أسعار الصرف
    updateExchangeRatesDisplay() {
        try {
            const usdToTryElement = document.getElementById('usdToTry');
            const usdToSypElement = document.getElementById('usdToSyp');

            if (usdToTryElement) usdToTryElement.value = this.exchangeRates.TRY;
            if (usdToSypElement) usdToSypElement.value = this.exchangeRates.SYP;
        } catch (error) {
            console.error('خطأ في تحديث أسعار الصرف:', error);
        }
    }

    // حفظ أسعار الصرف
    saveExchangeRates() {
        try {
            const usdToTry = parseFloat(document.getElementById('usdToTry').value);
            const usdToSyp = parseFloat(document.getElementById('usdToSyp').value);

            if (isNaN(usdToTry) || usdToTry <= 0 || isNaN(usdToSyp) || usdToSyp <= 0) {
                this.showAlert('يرجى إدخال أسعار صرف صحيحة', 'error');
                return;
            }

            this.exchangeRates.TRY = usdToTry;
            this.exchangeRates.SYP = usdToSyp;

            if (this.saveExchangeRates()) {
                this.showAlert('تم حفظ أسعار الصرف بنجاح');
                this.updateAllDisplays();
            }
        } catch (error) {
            console.error('خطأ في حفظ أسعار الصرف:', error);
            this.showAlert('خطأ في حفظ أسعار الصرف', 'error');
        }
    }

    // تحديث التبرعات الحديثة
    updateRecentDonations() {
        try {
            const recentList = document.getElementById('recentList');
            if (!recentList) return;

            const recentDonations = this.donations.slice(0, 5);
            const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };

            recentList.innerHTML = recentDonations.map(donation => `
                <div class="recent-item">
                    <span>${this.escapeHtml(donation.name)}</span>
                    <span style="font-weight: 600;" class="${donation.currency.toLowerCase()}">
                        ${donation.amount.toLocaleString()}${currencySymbols[donation.currency]}
                    </span>
                </div>
            `).join('');
        } catch (error) {
            console.error('خطأ في تحديث التبرعات الحديثة:', error);
        }
    }

    // تحديث وقت آخر تحديث
    updateLastUpdateTime() {
        try {
            const updateElement = document.getElementById('lastUpdate');
            if (updateElement) {
                const now = new Date().toLocaleTimeString('ar-EG');
                updateElement.textContent = `آخر تحديث: ${now}`;
            }
        } catch (error) {
            console.error('خطأ في تحديث وقت التحديث:', error);
        }
    }

    // تحديث القائمة الجانبية
    updateSidebar() {
        try {
            // تحديث الإحصائيات في القائمة الجانبية
            const totals = {
                USD: 0,
                TRY: 0,
                SYP: 0
            };

            this.donations.forEach(donation => {
                totals[donation.currency] += donation.amount;
            });

            const sidebarUSDElement = document.getElementById('sidebarUSD');
            const sidebarTRYElement = document.getElementById('sidebarTRY');
            const sidebarSYPElement = document.getElementById('sidebarSYP');

            if (sidebarUSDElement) sidebarUSDElement.textContent = `${totals.USD.toLocaleString()}$`;
            if (sidebarTRYElement) sidebarTRYElement.textContent = `${totals.TRY.toLocaleString()}₺`;
            if (sidebarSYPElement) sidebarSYPElement.textContent = `${totals.SYP.toLocaleString()}ل.س`;

            // تحديث آخر التبرعات في القائمة الجانبية
            const sidebarRecentList = document.getElementById('sidebarRecentList');
            if (sidebarRecentList) {
                const recentDonations = this.donations.slice(0, 3);
                const currencySymbols = { USD: '$', TRY: '₺', SYP: 'ل.س' };

                sidebarRecentList.innerHTML = recentDonations.map(donation => `
                    <div class="recent-item">
                        <span>${this.escapeHtml(donation.name)}</span>
                        <span style="font-weight: 600;" class="${donation.currency.toLowerCase()}">
                            ${donation.amount.toLocaleString()}${currencySymbols[donation.currency]}
                        </span>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('خطأ في تحديث القائمة الجانبية:', error);
        }
    }

    // تصدير إلى Excel
    exportToExcel() {
        try {
            if (this.donations.length === 0) {
                this.showAlert('لا توجد بيانات للتصدير', 'warning');
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(this.donations.map(d => ({
                'اسم المتبرع': d.name,
                'المبلغ': d.amount,
                'العملة': d.currency,
                'الوقت': d.time,
                'التاريخ': new Date(d.date).toLocaleDateString('ar-EG')
            })));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'التبرعات');
            
            const fileName = `تبرعات_حملة_المحبة_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            
            this.showAlert('تم تصدير البيانات إلى Excel بنجاح');
        } catch (error) {
            console.error('خطأ في التصدير إلى Excel:', error);
            this.showAlert('خطأ في تصدير البيانات', 'error');
        }
    }

    // استيراد من Excel
    importFromExcel(file) {
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    if (jsonData.length === 0) {
                        this.showAlert('الملف لا يحتوي على بيانات', 'warning');
                        return;
                    }

                    const newDonations = jsonData.map((row, index) => ({
                        id: Date.now() + index,
                        name: row['اسم المتبرع'] || row['Name'] || 'مجهول',
                        amount: parseFloat(row['المبلغ'] || row['Amount'] || 0),
                        currency: row['العملة'] || 'USD',
                        time: new Date().toLocaleTimeString('ar-EG'),
                        date: new Date().toISOString(),
                        timestamp: Date.now() + index
                    })).filter(d => d.amount > 0 && ['USD', 'TRY', 'SYP'].includes(d.currency));

                    if (newDonations.length === 0) {
                        this.showAlert('لم يتم العثور على تبرعات صالحة في الملف', 'warning');
                        return;
                    }

                    this.donations.unshift(...newDonations);
                    
                    if (this.saveDonations()) {
                        this.showAlert(`تم استيراد ${newDonations.length} تبرع بنجاح`);
                        this.updateAllDisplays();
                    }

                } catch (error) {
                    console.error('خطأ في معالجة ملف Excel:', error);
                    this.showAlert('خطأ في معالجة الملف', 'error');
                }
            };

            reader.onerror = () => {
                this.showAlert('خطأ في قراءة الملف', 'error');
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            this.showAlert('خطأ في استيراد البيانات', 'error');
        }
    }

    // نسخ احتياطي
    backupData() {
        try {
            const backup = {
                donations: this.donations,
                exchangeRates: this.exchangeRates,
                backupDate: new Date().toISOString(),
                version: '2.0'
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donations_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showAlert('تم إنشاء نسخة احتياطية بنجاح');
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            this.showAlert('خطأ في إنشاء النسخة الاحتياطية', 'error');
        }
    }

    // استعادة نسخة
    restoreData() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const backup = JSON.parse(event.target.result);
                        
                        if (!backup.donations || !Array.isArray(backup.donations)) {
                            this.showAlert('ملف النسخة الاحتياطية غير صالح', 'error');
                            return;
                        }

                        if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
                            return;
                        }

                        this.donations = backup.donations;
                        if (backup.exchangeRates) {
                            this.exchangeRates = backup.exchangeRates;
                            this.saveExchangeRates();
                        }
                        
                        if (this.saveDonations()) {
                            this.showAlert('تم استعادة النسخة الاحتياطية بنجاح');
                            this.updateAllDisplays();
                        }

                    } catch (error) {
                        console.error('خطأ في تحليل ملف النسخة الاحتياطية:', error);
                        this.showAlert('ملف النسخة الاحتياطية تالف', 'error');
                    }
                };

                reader.readAsText(file);
            };

            input.click();
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            this.showAlert('خطأ في استعادة النسخة الاحتياطية', 'error');
        }
    }

    // إدارة التحديد
    toggleSelection(id) {
        if (this.selectedDonations.has(id)) {
            this.selectedDonations.delete(id);
        } else {
            this.selectedDonations.add(id);
        }
        this.updateManagementList();
    }

    selectAllDonations() {
        const currencyFilter = document.getElementById('currencyFilter')?.value || 'all';
        const filteredDonations = currencyFilter === 'all' 
            ? this.donations 
            : this.donations.filter(d => d.currency === currencyFilter);

        filteredDonations.forEach(donation => {
            this.selectedDonations.add(donation.id);
        });
        this.updateManagementList();
        this.showAlert(`تم تحديد ${filteredDonations.length} تبرع`);
    }

    // نافذة التعديل
    openEditModal(id) {
        try {
            const donation = this.donations.find(d => d.id === id);
            if (!donation) return;

            this.currentEditId = id;
            
            document.getElementById('editDonorName').value = donation.name;
            document.getElementById('editDonationAmount').value = donation.amount;
            document.getElementById('editDonationCurrency').value = donation.currency;
            document.getElementById('editModal').classList.add('active');
        } catch (error) {
            console.error('خطأ في فتح نافذة التعديل:', error);
            this.showAlert('خطأ في فتح نافذة التعديل', 'error');
        }
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditId = null;
    }

    saveEdit() {
        try {
            if (!this.currentEditId) return;

            const newName = document.getElementById('editDonorName').value;
            const newAmount = document.getElementById('editDonationAmount').value;
            const newCurrency = document.getElementById('editDonationCurrency').value;

            if (this.editDonation(this.currentEditId, newName, newAmount, newCurrency)) {
                this.closeEditModal();
            }
        } catch (error) {
            console.error('خطأ في حفظ التعديل:', error);
            this.showAlert('خطأ في حفظ التعديل', 'error');
        }
    }

    // تصفية حسب العملة
    filterByCurrency() {
        this.updateManagementList();
    }

    // عرض قسم معين مع تحديث القائمة الجانبية
    showSection(sectionName) {
        // تحديث القائمة الجانبية لللاب توب
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSidebarItem = document.querySelector(`.sidebar-item[onclick="showSection('${sectionName}')"]`);
        if (activeSidebarItem) {
            activeSidebarItem.classList.add('active');
        }

        // تحديث القائمة الجانبية للجوال
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[onclick="showSection('${sectionName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // إخفاء جميع الأقسام
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // إخفاء القائمة الجانبية على الجوال
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) {
            mobileNav.classList.remove('active');
        }
        
        // إظهار القسم المطلوب
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // مستمعات الأحداث
    initEventListeners() {
        // البحث في التبرعات
        const searchInput = document.getElementById('searchDonations');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const donations = document.querySelectorAll('.managed-donation');
                
                donations.forEach(donation => {
                    const text = donation.textContent.toLowerCase();
                    donation.style.display = text.includes(searchTerm) ? 'flex' : 'none';
                });
            });
        }

        // استيراد Excel
        const excelFileInput = document.getElementById('excelFile');
        if (excelFileInput) {
            excelFileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importFromExcel(e.target.files[0]);
                    e.target.value = ''; // reset input
                }
            });
        }

        // قائمة الجوال
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileNav = document.getElementById('mobileNav');
        
        if (mobileMenuBtn && mobileNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });

            // إغلاق القائمة عند النقر خارجها
            document.addEventListener('click', (e) => {
                if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    mobileNav.classList.remove('active');
                }
            });
        }

        // إغلاق النافذة المنبثقة بالزر ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal();
            }
        });
    }

    // تهيئة لوحة التحكم
    initAdminPanel() {
        this.updateAllDisplays();
        this.showSection('add'); // عرض قسم الإضافة افتراضياً
    }

    // تهيئة شاشة العرض
    initDisplay() {
        this.updateAllDisplays();
    }

    // رسائل التنبيه
    showAlert(message, type = 'success') {
        try {
            const alert = document.getElementById('alertMessage');
            if (!alert) return;

            alert.textContent = message;
            alert.className = 'alert-message show';
            
            if (type === 'error') {
                alert.classList.add('error');
            } else if (type === 'warning') {
                alert.classList.add('warning');
            }

            setTimeout(() => {
                alert.classList.remove('show');
            }, 4000);
        } catch (error) {
            console.error('خطأ في عرض التنبيه:', error);
        }
    }

    // تشغيل تحديث البيانات
    triggerDataUpdate() {
        try {
            localStorage.setItem('donationsLastUpdate', Date.now().toString());
        } catch (error) {
            console.error('خطأ في تشغيل تحديث البيانات:', error);
        }
    }

    // تهريب HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// إنشاء النظام
const donationSystem = new AdvancedDonationSystem();

// الدوال العامة للاستخدام في HTML
function setAmount(amount, currency) {
    try {
        const amountInput = document.getElementById('donationAmount');
        const currencySelect = document.getElementById('donationCurrency');
        
        if (amountInput) {
            amountInput.value = amount;
        }
        
        if (currencySelect) {
            currencySelect.value = currency;
        }
        
        if (amountInput) {
            amountInput.focus();
        }
    } catch (error) {
        console.error('خطأ في تعيين المبلغ:', error);
    }
}

function addDonation() {
    try {
        const name = document.getElementById('donorName')?.value;
        const amount = document.getElementById('donationAmount')?.value;
        const currency = document.getElementById('donationCurrency')?.value;
        
        if (donationSystem.addDonation(name, amount, currency)) {
            document.getElementById('donorName').value = '';
            document.getElementById('donationAmount').value = '';
            document.getElementById('donorName').focus();
        }
    } catch (error) {
        console.error('خطأ في إضافة التبرع:', error);
    }
}

function showSection(sectionName) {
    donationSystem.showSection(sectionName);
}

function selectAllDonations() {
    donationSystem.selectAllDonations();
}

function deleteSelectedDonations() {
    donationSystem.deleteSelectedDonations();
}

function filterByCurrency() {
    donationSystem.filterByCurrency();
}

function saveExchangeRates() {
    donationSystem.saveExchangeRates();
}

function exportToExcel() {
    donationSystem.exportToExcel();
}

function backupData() {
    donationSystem.backupData();
}

function restoreData() {
    donationSystem.restoreData();
}

function closeEditModal() {
    donationSystem.closeEditModal();
}

function saveEdit() {
    donationSystem.saveEdit();
}

// دعم الإدخال بالزر Enter
document.addEventListener('DOMContentLoaded', function() {
    try {
        const donorName = document.getElementById('donorName');
        const donationAmount = document.getElementById('donationAmount');
        
        if (donorName && donationAmount) {
            donorName.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    donationAmount.focus();
                }
            });
            
            donationAmount.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addDonation();
                }
            });
        }

        // إدخال التعديل
        const editDonorName = document.getElementById('editDonorName');
        const editDonationAmount = document.getElementById('editDonationAmount');
        
        if (editDonorName && editDonationAmount) {
            editDonorName.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    editDonationAmount.focus();
                }
            });
            
            editDonationAmount.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
        }
    } catch (error) {
        console.error('خطأ في إعداد مستمعات الأحداث:', error);
    }
});

// معالجة أخطاء التحميل
window.addEventListener('error', function(e) {
    console.error('حدث خطأ:', e.error);
});

// مزامنة بين النوافذ
window.addEventListener('storage', function(e) {
    if (e.key === 'multiCurrencyDonations' || e.key === 'exchangeRates' || e.key === 'donationsLastUpdate') {
        try {
            donationSystem.donations = donationSystem.loadDonations();
            donationSystem.exchangeRates = donationSystem.loadExchangeRates();
            donationSystem.updateAllDisplays();
        } catch (error) {
            console.error('خطأ في المزامنة:', error);
        }
    }
});