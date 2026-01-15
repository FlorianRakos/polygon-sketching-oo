
class DrawingApp {
    constructor(canvasId) {
        console.log("--- Draw App Loaded ---");
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // State
        this.finishedPolygons = []; // Array of arrays (list of completed polygons)
        this.currentPolygon = [];   // Array of points for the active polygon
        this.previewPos = null;     // Current mouse position {x, y}

        // Undo/Redo History
        this.history = [];          // Stack of previous states
        this.redoStack = [];        // Stack of undone states

        // Bind events
        this.setupEventListeners();

        // Initial render
        this.render();
    }

    setupEventListeners() {
        // 1. Mouse Move: Update preview line
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.previewPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            this.render();
        });

        // 2. Mouse Click: Add Point
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const pt = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            this.saveStateToHistory(); // Save before changing state
            this.currentPolygon.push(pt);
            this.render();
        });

        // 3. Double Click: Finish Polygon
        this.canvas.addEventListener('dblclick', (e) => {
            if (this.currentPolygon.length > 0) {
                this.saveStateToHistory();

                // Add current polygon to finished list
                this.finishedPolygons.push(this.currentPolygon);
                this.currentPolygon = []; // Reset current
                this.render();
            }
        });

        // 4. Right Click: Cancel current polygon (Optional utility)
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.saveStateToHistory();
            this.currentPolygon = [];
            this.render();
        });

        // 5. Buttons
        document.getElementById('btnUndo').addEventListener('click', () => this.undo());
        document.getElementById('btnRedo').addEventListener('click', () => this.redo());
    }

    // --- Core Logic ---

    render() {
        // 1. Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Draw all finished polygons (Black)
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.finishedPolygons.forEach(poly => this.drawPolyLine(poly));

        // 3. Draw the current polygon being drawn (Black)
        if (this.currentPolygon.length > 0) {
            this.drawPolyLine(this.currentPolygon);
        }

        // 4. Draw Preview Line (Red)
        // From the last point of currentPolygon -> to Mouse Position
        if (this.currentPolygon.length > 0 && this.previewPos) {
            const lastPoint = this.currentPolygon[this.currentPolygon.length - 1];

            this.ctx.beginPath();
            this.ctx.moveTo(lastPoint.x, lastPoint.y);
            this.ctx.lineTo(this.previewPos.x, this.previewPos.y);
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    // Helper to draw a list of points
    drawPolyLine(points) {
        if (points.length < 2) {
            // If it's just a single point, draw a dot
            if(points.length === 1) {
                this.ctx.beginPath();
                this.ctx.arc(points[0].x, points[0].y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
    }

    // --- Undo / Redo System ---

    saveStateToHistory() {
        // We must Deep Copy the arrays so they don't change later
        const stateSnapshot = {
            finished: JSON.parse(JSON.stringify(this.finishedPolygons)),
            current: JSON.parse(JSON.stringify(this.currentPolygon))
        };

        this.history.push(stateSnapshot);
        this.redoStack = []; // Clear redo stack on new action
    }

    undo() {
        if (this.history.length === 0) return;

        // 1. Save current state to Redo Stack
        const currentState = {
            finished: JSON.parse(JSON.stringify(this.finishedPolygons)),
            current: JSON.parse(JSON.stringify(this.currentPolygon))
        };
        this.redoStack.push(currentState);

        // 2. Pop previous state from History
        const prevState = this.history.pop();

        // 3. Restore State
        this.finishedPolygons = prevState.finished;
        this.currentPolygon = prevState.current;

        this.render();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        // 1. Save current state to History (so we can undo the redo)
        const currentState = {
            finished: JSON.parse(JSON.stringify(this.finishedPolygons)),
            current: JSON.parse(JSON.stringify(this.currentPolygon))
        };
        this.history.push(currentState);

        // 2. Pop next state from Redo Stack
        const nextState = this.redoStack.pop();

        // 3. Restore State
        this.finishedPolygons = nextState.finished;
        this.currentPolygon = nextState.current;

        this.render();
    }
}

// Initialize the app
const app = new DrawingApp("canvas");