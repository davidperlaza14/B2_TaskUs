        // ==========================================
        // SISTEMA DE PROGRESO HÍBRIDO (AUTOMÁTICO + MANUAL)
        // ==========================================
        
        // Configuración
        const CONFIG = {
            startDate: new Date('2026-02-09'),
            endDate: new Date('2026-07-09'),
            totalDays: 150,
            storageKey: 'englishProgress_v2'
        };
        
        // Estado global
        let state = {
            manualOffset: 0,
            lastAutoDays: 0
        };
        
        // Inicialización
        function init() {
            loadState();
            updateDisplay();
            generateTracker();
            updateCurrentDate();
            
            // Actualizar automáticamente cada hora
            setInterval(() => {
                updateDisplay();
                updateCurrentDate();
            }, 3600000);
            
            // Verificar si es un nuevo día
            checkNewDay();
        }
        
        // Cargar estado guardado
        function loadState() {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.manualOffset = parsed.manualOffset || 0;
            }
        }
        
        // Guardar estado
        function saveState() {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
        }
        
        // Calcular días automáticos basados en fecha actual
        function getAutoDays() {
            const today = new Date();
            
            if (today < CONFIG.startDate) return 0;
            if (today > CONFIG.endDate) return CONFIG.totalDays;
            
            const diffTime = today - CONFIG.startDate;
            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        
        // Obtener progreso total (auto + manual)
        function getProgress() {
            const autoDays = getAutoDays();
            state.lastAutoDays = autoDays;
            
            let totalDays = autoDays + state.manualOffset;
            
            // Limitar entre 0 y 150
            totalDays = Math.max(0, Math.min(totalDays, CONFIG.totalDays));
            
            return {
                days: totalDays,
                autoDays: autoDays,
                percentage: Math.round((totalDays / CONFIG.totalDays) * 100),
                week: Math.floor(totalDays / 7) + 1,
                remaining: CONFIG.totalDays - totalDays,
                isComplete: totalDays >= CONFIG.totalDays
            };
        }
        
        // Actualizar toda la visualización
        function updateDisplay() {
            const progress = getProgress();
            
            // Actualizar barra
            const bar = document.getElementById('progressBar');
            bar.style.width = progress.percentage + '%';
            bar.textContent = progress.percentage + '%';
            
            // Cambiar color según progreso
            updateBarColor(progress.percentage);
            
            // Actualizar estadísticas
            document.getElementById('statDays').textContent = progress.days;
            document.getElementById('statWeeks').textContent = progress.week;
            document.getElementById('statPercentage').textContent = progress.percentage + '%';
            document.getElementById('statRemaining').textContent = progress.remaining;
            document.getElementById('daysRemaining').textContent = progress.remaining;
            
            // Actualizar mensaje motivacional
            updateMotivation(progress);
            
            // Actualizar indicador de ajuste manual
            updateAdjustDisplay();
            
            // Actualizar hitos
            updateMilestones(progress.days);
            
            // Verificar si completó
            if (progress.isComplete && !state.celebrated) {
                celebrate();
                state.celebrated = true;
                saveState();
            }
        }
        
        // Actualizar color de la barra
        function updateBarColor(percentage) {
            const bar = document.getElementById('progressBar');
            let gradient;
            
            if (percentage < 20) {
                gradient = 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)';
            } else if (percentage < 40) {
                gradient = 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)';
            } else if (percentage < 60) {
                gradient = 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)';
            } else if (percentage < 80) {
                gradient = 'linear-gradient(90deg, #a855f7 0%, #f59e0b 100%)';
            } else if (percentage < 100) {
                gradient = 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)';
            } else {
                gradient = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
            }
            
            bar.style.background = gradient;
        }
        
        // Actualizar mensaje motivacional
        function updateMotivation(progress) {
            const msg = document.getElementById('motivationMsg');
            const msgs = [
                { limit: 0, text: '🚀 ¡Listo para comenzar!', color: '#fcd34d' },
                { limit: 10, text: '💪 ¡Primeros pasos dados!', color: '#6ee7b7' },
                { limit: 20, text: '🔥 ¡Acostumbrándote al ritmo!', color: '#6ee7b7' },
                { limit: 30, text: '📈 ¡Construyendo hábitos!', color: '#6ee7b7' },
                { limit: 40, text: '🎯 ¡Vas por buen camino!', color: '#fcd34d' },
                { limit: 50, text: '⚡ ¡Mitad del camino! ¡No pares!', color: '#fcd34d' },
                { limit: 60, text: '🚀 ¡Momentum ganado!', color: '#fca5a5' },
                { limit: 70, text: '💎 ¡Nivel avanzado!', color: '#fca5a5' },
                { limit: 80, text: '🏆 ¡Casi listo para TaskUs!', color: '#fca5a5' },
                { limit: 90, text: '🔥 ¡Último empujón!', color: '#f87171' },
                { limit: 99, text: '🎯 ¡Un paso más!', color: '#f87171' },
                { limit: 100, text: '🎉 ¡OBJETIVO LOGRADO! ¡ERES B2!', color: '#6ee7b7' }
            ];
            
            for (let i = msgs.length - 1; i >= 0; i--) {
                if (progress.percentage >= msgs[i].limit) {
                    msg.textContent = msgs[i].text;
                    msg.style.color = msgs[i].color;
                    break;
                }
            }
        }
        
        // Actualizar display de ajuste manual
        function updateAdjustDisplay() {
            const adjustEl = document.getElementById('adjustValue');
            const offset = state.manualOffset;
            
            if (offset > 0) {
                adjustEl.textContent = `+${offset} días extra`;
                adjustEl.className = 'adjust-positive';
            } else if (offset < 0) {
                adjustEl.textContent = `${offset} días de descanso`;
                adjustEl.className = 'adjust-negative';
            } else {
                adjustEl.textContent = 'Sin ajustes (automático puro)';
                adjustEl.className = 'adjust-neutral';
            }
        }
        
        // Actualizar hitos visuales
        function updateMilestones(days) {
            const milestones = [30, 60, 90, 120, 150];
            milestones.forEach((milestone, index) => {
                const el = document.getElementById(`milestone${index + 1}`);
                if (days >= milestone) {
                    el.style.textDecoration = 'line-through';
                    el.style.opacity = '0.6';
                    el.innerHTML = el.innerHTML.replace('🔘', '✅').replace('⚪', '✅');
                }
            });
            
            // Actualizar estados de tabla
            updateStatusTable(days);
        }
        
        // Actualizar tabla de estados
        function updateStatusTable(days) {
            const statuses = [
                { day: 1, id: 'status1' },
                { day: 7, id: 'status2' },
                { day: 30, id: 'status3' },
                { day: 60, id: 'status4' },
                { day: 90, id: 'status5' },
                { day: 120, id: 'status6' },
                { day: 150, id: 'status7' }
            ];
            
            statuses.forEach(status => {
                const el = document.getElementById(status.id);
                if (days >= status.day) {
                    el.textContent = '✅ Completado';
                    el.style.color = '#10b981';
                    el.style.fontWeight = 'bold';
                }
            });
        }
        
        // Actualizar fecha actual mostrada
        function updateCurrentDate() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            document.getElementById('currentDateDisplay').textContent = 
                '📍 Hoy es: ' + now.toLocaleDateString('es-ES', options);
        }
        
        // Verificar si es nuevo día
        function checkNewDay() {
            const lastVisit = localStorage.getItem('lastVisit');
            const today = new Date().toDateString();
            
            if (lastVisit !== today) {
                localStorage.setItem('lastVisit', today);
                // Aquí podrías agregar notificaciones o celebraciones diarias
            }
        }
        
        // ==========================================
        // CONTROLES MANUALES
        // ==========================================
        
        function addDay() {
            state.manualOffset += 1;
            saveState();
            updateDisplay();
            
            // Feedback visual
            showToast('➕ Día agregado: ¡Excelente trabajo!');
        }
        
        function addWeek() {
            state.manualOffset += 7;
            saveState();
            updateDisplay();
            showToast('➕ Semana completa agregada: ¡Impresionante!');
        }
        
        function removeDay() {
            state.manualOffset -= 1;
            saveState();
            updateDisplay();
            showToast('➖ Día de descanso registrado: ¡El descanso también es productivo!');
        }
        
        function resetManual() {
            state.manualOffset = 0;
            saveState();
            updateDisplay();
            showToast('🔄 Progreso reseteado a automático');
        }
        
        function test100() {
            // Simular día 150 para testing
            const autoDays = getAutoDays();
            state.manualOffset = 150 - autoDays;
            saveState();
            updateDisplay();
            celebrate();
        }
        
        // ==========================================
        // EFECTOS Y UTILIDADES
        // ==========================================
        
        function showToast(message) {
            // Crear toast notification
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1e293b;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        
        function celebrate() {
            const container = document.getElementById('celebration');
            container.style.display = 'block';
            
            const colors = ['#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#60a5fa'];
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
                confetti.style.opacity = Math.random();
                container.appendChild(confetti);
            }
            
            setTimeout(() => {
                container.innerHTML = '';
                container.style.display = 'none';
            }, 5000);
        }
        
        function generateTracker() {
            const tracker = document.getElementById('tracker');
            const dias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
            
            // Cargar estado guardado de días
            const savedDays = JSON.parse(localStorage.getItem('trackerDays') || '[]');
            
            for (let i = 0; i < 7; i++) {
                const day = document.createElement('div');
                day.className = 'day-box';
                if (savedDays.includes(i)) day.classList.add('completed');
                day.textContent = dias[i];
                day.onclick = function() {
                    this.classList.toggle('completed');
                    saveTrackerState();
                };
                tracker.appendChild(day);
            }
        }
        
        function saveTrackerState() {
            const days = [];
            document.querySelectorAll('.day-box').forEach((box, index) => {
                if (box.classList.contains('completed')) days.push(index);
            });
            localStorage.setItem('trackerDays', JSON.stringify(days));
        }
        
        // Agregar animaciones CSS dinámicas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Smooth scroll para navegación
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Iniciar todo cuando cargue la página
        window.onload = init;
