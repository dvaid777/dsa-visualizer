

console.log("🚀 DSA Visualizer loading...");

// ========== DOM ELEMENTS ==========
const themeToggle = document.getElementById('themeToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const algorithmTitle = document.getElementById('algorithmTitle');
const generateArrayBtn = document.getElementById('generateArray');
const arraySizeSlider = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const visualization = document.getElementById('visualization');
const pseudoCode = document.getElementById('pseudoCode');
const timeComplexity = document.getElementById('timeComplexity');
const spaceComplexity = document.getElementById('spaceComplexity');
const algorithmExplanation = document.getElementById('algorithmExplanation');

// Control buttons
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');

console.log("✅ DOM elements loaded");

// ========== ALGORITHM DATA ==========
const algorithms = {
    sorting: [
        { 
            id: 'bubble-sort', 
            name: 'Bubble Sort', 
            icon: 'fas fa-sort-amount-up-alt',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            pseudoCode: `procedure bubbleSort(A: list of sortable items)
    n = length(A)
    repeat
        swapped = false
        for i = 1 to n-1 do
            // Compare adjacent elements
            if A[i-1] > A[i] then
                // Swap if they are in wrong order
                swap(A[i-1], A[i])
                swapped = true
            end if
        end for
        // Reduce n because last element is sorted
        n = n - 1
    until not swapped
end procedure`,
            explanation: `Bubble Sort is a simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.`
        },
        { 
            id: 'selection-sort', 
            name: 'Selection Sort', 
            icon: 'fas fa-mouse-pointer',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            pseudoCode: `procedure selectionSort(A: list of sortable items)
    n = length(A)
    for i = 0 to n-2 do
        // Find minimum element in unsorted part
        minIndex = i
        for j = i+1 to n-1 do
            if A[j] < A[minIndex] then
                minIndex = j
            end if
        end for
        
        // Swap found minimum with first element
        if minIndex != i then
            swap(A[i], A[minIndex])
        end if
    end for
end procedure`,
            explanation: `Selection Sort divides the input list into two parts: a sorted sublist and an unsorted sublist.`
        }
    ],
    
    searching: [
        { 
            id: 'linear-search', 
            name: 'Linear Search', 
            icon: 'fas fa-search',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            pseudoCode: `procedure linearSearch(A: list of items, target: item)
    n = length(A)
    for i = 0 to n-1 do
        if A[i] == target then
            return i  // Found at index i
        end if
    end for
    return -1  // Not found
end procedure`,
            explanation: `Linear Search sequentially checks each element of the list.`
        },
        { 
            id: 'binary-search', 
            name: 'Binary Search', 
            icon: 'fas fa-search',
            timeComplexity: 'O(log n)',
            spaceComplexity: 'O(1)',
            pseudoCode: `procedure binarySearch(A: sorted list of items, target: item)
    low = 0
    high = length(A) - 1
    
    while low <= high do
        mid = floor((low + high) / 2)
        
        if A[mid] == target then
            return mid  // Found at index mid
        else if A[mid] < target then
            low = mid + 1  // Search right half
        else
            high = mid - 1  // Search left half
        end if
    end while
    
    return -1  // Not found
end procedure`,
            explanation: `Binary Search is an efficient algorithm for finding an item from a sorted list.`
        }
    ]
};

// ========== STATE MANAGEMENT ==========
let state = {
    currentAlgorithm: null,
    currentArray: [],
    originalArray: [],
    isPlaying: false,
    animationSpeed: 5,
    timeoutId: null,
    currentStep: 0,
    totalSteps: 0,
    algorithmState: {},
    isPaused: false,
    isCompleted: false
};

// ========== SIMPLE VISUALIZATION ENGINE ==========
const visualizationEngine = {
    // FIXED: Simple bar rendering
    // Update the renderArray function to include these new highlight types:

renderArray(array, highlights = {}) {
    console.log("🎨 Rendering array:", array);
    
    const container = document.getElementById("visualization");
    if (!container) {
        console.error("❌ Visualization container not found!");
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (!array || array.length === 0) {
        container.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-code-branch fa-3x"></i>
                <p>Select an algorithm to start</p>
            </div>
        `;
        return;
    }
    
    // Calculate dimensions
    const maxValue = Math.max(...array);
    const containerHeight = 300;
    const barSpacing = 2;
    const barWidth = Math.max(10, Math.min(30, (800 - (array.length - 1) * barSpacing) / array.length));
    
    // Create bars
    array.forEach((value, index) => {
        const barHeight = (value / maxValue) * (containerHeight - 60);
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // Apply base styles
        bar.style.width = `${barWidth}px`;
        bar.style.height = `${barHeight}px`;
        bar.style.margin = `0 ${barSpacing / 2}px`;
        bar.style.backgroundColor = 'var(--array-element)';
        bar.style.borderRadius = '4px 4px 0 0';
        bar.style.transition = 'all 0.3s ease';
        bar.style.position = 'relative';
        
        // ====== APPLY HIGHLIGHTS (ORDER MATTERS!) ======
        
        // 1. Found element (highest priority)
        if (highlights.found && highlights.found.includes(index)) {
            bar.style.backgroundColor = 'var(--accent-success)';
            bar.style.boxShadow = '0 0 20px var(--accent-success)';
            bar.style.transform = 'scale(1.1)';
        }
        
        // 2. Binary search pointers
        else if (highlights.mid === index) {
            bar.style.backgroundColor = '#8b5cf6'; // Purple for mid
            bar.style.boxShadow = '0 0 15px #8b5cf6';
            bar.style.transform = 'scale(1.05)';
        }
        else if (highlights.low === index) {
            bar.style.backgroundColor = '#10b981'; // Green for low
        }
        else if (highlights.high === index) {
            bar.style.backgroundColor = '#ef4444'; // Red for high
        }
        
        // 3. Minimum element (selection sort)
        else if (highlights.minimum === index) {
            bar.style.backgroundColor = '#f59e0b'; // Yellow for minimum
            bar.style.boxShadow = '0 0 10px #f59e0b';
        }
        
        // 4. Standard algorithm states
        else if (highlights.comparing && highlights.comparing.includes(index)) {
            bar.style.backgroundColor = 'var(--array-compare)';
            bar.style.transform = 'scale(1.05)';
        }
        else if (highlights.swapping && highlights.swapping.includes(index)) {
            bar.style.backgroundColor = 'var(--array-swap)';
            bar.style.transform = 'scale(1.1)';
        }
        else if (highlights.sorted && highlights.sorted.includes(index)) {
            bar.style.backgroundColor = 'var(--array-sorted)';
        }
        else if (highlights.current === index) {
            bar.style.backgroundColor = 'var(--accent-warning)';
        }
        else if (highlights.visited && highlights.visited.includes(index)) {
            bar.style.backgroundColor = 'var(--accent-primary)';
            bar.style.opacity = '0.7';
        }
        
        // Add value label
        const label = document.createElement('div');
        label.className = 'bar-label';
        
        // Custom labels for special elements
        if (highlights.mid === index) {
            label.textContent = `Mid: ${value}`;
        } else if (highlights.low === index) {
            label.textContent = `Low: ${value}`;
        } else if (highlights.high === index) {
            label.textContent = `High: ${value}`;
        } else if (highlights.minimum === index) {
            label.textContent = `Min: ${value}`;
        } else if (highlights.current === index) {
            label.textContent = `Current: ${value}`;
        } else if (highlights.found && highlights.found.includes(index)) {
            label.textContent = `🎯 ${value}`;
        } else {
            label.textContent = value;
        }
        
        label.style.position = 'absolute';
        label.style.bottom = '-25px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.color = 'var(--text-secondary)';
        label.style.fontSize = '12px';
        label.style.fontFamily = 'JetBrains Mono, monospace';
        label.style.fontWeight = '500';
        label.style.whiteSpace = 'nowrap';
        
        // Highlight label for special elements
        if (bar.style.backgroundColor !== 'var(--array-element)') {
            label.style.color = 'var(--text-primary)';
            label.style.fontWeight = '600';
        }
        
        // Add index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'index-label';
        indexLabel.textContent = index;
        indexLabel.style.position = 'absolute';
        indexLabel.style.top = '-20px';
        indexLabel.style.left = '50%';
        indexLabel.style.transform = 'translateX(-50%)';
        indexLabel.style.color = 'var(--text-muted)';
        indexLabel.style.fontSize = '10px';
        indexLabel.style.fontFamily = 'JetBrains Mono, monospace';
        
        bar.appendChild(label);
        bar.appendChild(indexLabel);
        container.appendChild(bar);
    });
    
    console.log(`✅ Rendered ${array.length} bars`);
},
    
    highlightCodeLine(lineNumber) {
        const codeElement = pseudoCode;
        if (!codeElement.textContent) return;
        
        const lines = codeElement.textContent.split('\n');
        codeElement.innerHTML = '';
        
        lines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            lineElement.style.padding = '2px 0';
            lineElement.style.fontFamily = "'JetBrains Mono', monospace";
            lineElement.style.fontSize = '0.9rem';
            lineElement.style.whiteSpace = 'pre';
            
            if (index === lineNumber) {
                lineElement.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                lineElement.style.borderLeft = '3px solid var(--accent-primary)';
                lineElement.style.paddingLeft = '5px';
            }
            
            codeElement.appendChild(lineElement);
        });
    },
    
    updateExplanation(text) {
        algorithmExplanation.innerHTML = `
            <div class="current-step">
                <strong>🔍 Step ${state.currentStep}:</strong> ${text}
            </div>
            <div class="progress-info">
                Progress: ${state.currentStep} / ${state.totalSteps} steps
                ${state.totalSteps > 0 ? `(${Math.round((state.currentStep / state.totalSteps) * 100)}%)` : ''}
            </div>
        `;
    }
};

// ========== SIMPLE ALGORITHM IMPLEMENTATIONS ==========
const algorithmImplementations = {
    'bubble-sort': {
        init(array) {
            console.log("🔄 Initializing Bubble Sort");
            return {
                array: [...array],
                n: array.length,
                i: 0,
                swapped: false,
                sortedIndices: [],
                isComplete: false,
                step: 0,
                description: 'Starting Bubble Sort...'
            };
        },
        
        next(algoState) {
            const newState = { ...algoState };
            newState.step++;
            
            // Create highlights
            const highlights = {
                comparing: [newState.i, newState.i + 1],
                sorted: newState.sortedIndices
            };
            
            // Compare and swap
            if (newState.array[newState.i] > newState.array[newState.i + 1]) {
                // Swap
                [newState.array[newState.i], newState.array[newState.i + 1]] = 
                    [newState.array[newState.i + 1], newState.array[newState.i]];
                newState.swapped = true;
                highlights.swapping = [newState.i, newState.i + 1];
                newState.description = `Swapping ${newState.array[newState.i]} and ${newState.array[newState.i + 1]}`;
                visualizationEngine.highlightCodeLine(6);
            } else {
                newState.description = `Comparing ${newState.array[newState.i]} and ${newState.array[newState.i + 1]}`;
                visualizationEngine.highlightCodeLine(4);
            }
            
            // Move to next pair
            newState.i++;
            
            // Check if pass complete
            if (newState.i >= newState.n - 1) {
                newState.sortedIndices.push(newState.n - 1);
                
                if (!newState.swapped) {
                    // Done
                    newState.isComplete = true;
                    newState.sortedIndices = Array.from({ length: newState.array.length }, (_, i) => i);
                    newState.description = "✅ Sorting complete!";
                    visualizationEngine.highlightCodeLine(-1);
                } else {
                    // Next pass
                    newState.n--;
                    newState.i = 0;
                    newState.swapped = false;
                    newState.description = `Starting new pass. Sorted: ${newState.sortedIndices.length} elements`;
                }
            }
            
            // Update visualization
            visualizationEngine.renderArray(newState.array, highlights);
            visualizationEngine.updateExplanation(newState.description);
            
            return newState;
        },
        
        getTotalSteps(array) {
            return array.length * (array.length - 1) / 2;
        }
    },
    
    'linear-search': {
        init(array) {
            const target = array[Math.floor(Math.random() * array.length)];
            console.log(`🎯 Linear Search target: ${target}`);
            
            return {
                array: [...array],
                target: target,
                currentIndex: 0,
                foundIndex: -1,
                isComplete: false,
                step: 0,
                description: `Searching for ${target}...`
            };
        },
        
        next(algoState) {
            const newState = { ...algoState };
            newState.step++;
            
            const highlights = {
                current: newState.currentIndex,
                visited: Array.from({ length: newState.currentIndex }, (_, i) => i)
            };
            
            // Check current element
            if (newState.array[newState.currentIndex] === newState.target) {
                newState.foundIndex = newState.currentIndex;
                newState.isComplete = true;
                highlights.found = [newState.currentIndex];
                newState.description = `🎯 Found ${newState.target} at index ${newState.currentIndex}!`;
                visualizationEngine.highlightCodeLine(4);
            } else {
                newState.currentIndex++;
                newState.description = `Checking index ${newState.currentIndex} (value: ${newState.array[newState.currentIndex]})`;
                visualizationEngine.highlightCodeLine(3);
                
                if (newState.currentIndex >= newState.array.length) {
                    newState.isComplete = true;
                    newState.description = `Target ${newState.target} not found`;
                    visualizationEngine.highlightCodeLine(6);
                }
            }
            
            visualizationEngine.renderArray(newState.array, highlights);
            visualizationEngine.updateExplanation(newState.description);
            
            return newState;
        },
        
        getTotalSteps(array) {
            return array.length;
        }
    },
    // Add these AFTER the 'linear-search' implementation:

'selection-sort': {
    init(array) {
        console.log("🔄 Initializing Selection Sort");
        return {
            array: [...array],
            n: array.length,
            i: 0,
            minIndex: 0,
            j: 1,
            sortedIndices: [],
            isComplete: false,
            step: 0,
            description: 'Starting Selection Sort...'
        };
    },
    
    next(algoState) {
        const newState = { ...algoState };
        newState.step++;
        
        const highlights = {
            current: newState.i,
            comparing: [],
            sorted: newState.sortedIndices
        };
        
        if (newState.j < newState.n) {
            // Finding minimum element
            highlights.comparing = [newState.j, newState.minIndex];
            visualizationEngine.highlightCodeLine(5); // Compare line
            
            if (newState.array[newState.j] < newState.array[newState.minIndex]) {
                newState.minIndex = newState.j;
                newState.description = `Found new minimum ${newState.array[newState.minIndex]} at index ${newState.minIndex}`;
            } else {
                newState.description = `Comparing ${newState.array[newState.j]} with current minimum ${newState.array[newState.minIndex]}`;
            }
            
            newState.j++;
            
            // If we finished scanning this pass
            if (newState.j === newState.n) {
                // Check if we need to swap
                if (newState.minIndex !== newState.i) {
                    visualizationEngine.highlightCodeLine(9); // Swap check line
                    newState.description = `Ready to swap minimum ${newState.array[newState.minIndex]} with ${newState.array[newState.i]} at position ${newState.i}`;
                }
            }
        } else {
            // Time to swap (if needed)
            if (newState.minIndex !== newState.i) {
                // Perform swap
                [newState.array[newState.i], newState.array[newState.minIndex]] = 
                    [newState.array[newState.minIndex], newState.array[newState.i]];
                
                highlights.swapping = [newState.i, newState.minIndex];
                visualizationEngine.highlightCodeLine(11); // Swap line
                newState.description = `Swapped minimum ${newState.array[newState.i]} to position ${newState.i}`;
            } else {
                visualizationEngine.highlightCodeLine(9); // No swap needed line
                newState.description = `Minimum ${newState.array[newState.i]} already at correct position ${newState.i}`;
            }
            
            // Mark current position as sorted
            newState.sortedIndices.push(newState.i);
            
            // Move to next element
            newState.i++;
            newState.minIndex = newState.i;
            newState.j = newState.i + 1;
            
            // Check if complete
            if (newState.i >= newState.n - 1) {
                newState.isComplete = true;
                newState.sortedIndices = Array.from({ length: newState.array.length }, (_, i) => i);
                newState.description = "✅ Selection Sort complete!";
                visualizationEngine.highlightCodeLine(-1);
            } else {
                newState.description = `Moving to next unsorted element at position ${newState.i}`;
            }
        }
        
        // Add minimum to highlights
        if (!newState.isComplete) {
            highlights.minimum = newState.minIndex;
        }
        
        visualizationEngine.renderArray(newState.array, highlights);
        visualizationEngine.updateExplanation(newState.description);
        
        return newState;
    },
    
    getTotalSteps(array) {
        // Selection sort: n(n-1)/2 comparisons
        return array.length * (array.length - 1) / 2;
    }
},

'binary-search': {
    init(array) {
        // Binary search requires sorted array
        const sortedArray = [...array].sort((a, b) => a - b);
        
        // Pick a target that exists in the array
        const randomIndex = Math.floor(Math.random() * sortedArray.length);
        const target = sortedArray[randomIndex];
        
        console.log(`🎯 Binary Search target: ${target} in sorted array`);
        
        return {
            array: sortedArray,
            target: target,
            low: 0,
            high: sortedArray.length - 1,
            mid: -1,
            isComplete: false,
            step: 0,
            description: `Searching for ${target} in sorted array...`
        };
    },
    
    next(algoState) {
        const newState = { ...algoState };
        newState.step++;
        
        // Calculate mid point
        newState.mid = Math.floor((newState.low + newState.high) / 2);
        
        const highlights = {
            low: newState.low,
            high: newState.high,
            mid: newState.mid
        };
        
        visualizationEngine.highlightCodeLine(6); // Calculate mid line
        newState.description = `Checking mid index ${newState.mid} (value: ${newState.array[newState.mid]})`;
        
        // Check if found
        if (newState.array[newState.mid] === newState.target) {
            newState.isComplete = true;
            highlights.found = [newState.mid];
            visualizationEngine.highlightCodeLine(7); // Found line
            newState.description = `🎯 Found target ${newState.target} at index ${newState.mid}!`;
        } else if (newState.array[newState.mid] < newState.target) {
            // Search right half
            newState.low = newState.mid + 1;
            visualizationEngine.highlightCodeLine(9); // Search right line
            newState.description = `${newState.array[newState.mid]} < ${newState.target}, searching right half [${newState.low}, ${newState.high}]`;
        } else {
            // Search left half
            newState.high = newState.mid - 1;
            visualizationEngine.highlightCodeLine(11); // Search left line
            newState.description = `${newState.array[newState.mid]} > ${newState.target}, searching left half [${newState.low}, ${newState.high}]`;
        }
        
        // Check if not found
        if (newState.low > newState.high && !newState.isComplete) {
            newState.isComplete = true;
            visualizationEngine.highlightCodeLine(14); // Not found line
            newState.description = `Target ${newState.target} not found in the array.`;
        }
        
        visualizationEngine.renderArray(newState.array, highlights);
        visualizationEngine.updateExplanation(newState.description);
        
        return newState;
    },
    
    getTotalSteps(array) {
        // Binary search complexity: O(log n)
        return Math.ceil(Math.log2(array.length)) + 1;
    }
}
};

// ========== SIMPLE ANIMATION CONTROLLER ==========
const animationController = {
    play() {
        console.log("▶️ Play clicked");
        
        if (!state.currentAlgorithm) {
            alert('Please select an algorithm first!');
            return;
        }
        
        // Initialize if needed
        if (Object.keys(state.algorithmState).length === 0) {
            state.algorithmState = algorithmImplementations[state.currentAlgorithm].init(state.currentArray);
            state.totalSteps = algorithmImplementations[state.currentAlgorithm].getTotalSteps(state.currentArray);
            console.log(`📊 Total steps: ${state.totalSteps}`);
        }
        
        state.isPlaying = true;
        state.isPaused = false;
        state.isCompleted = false;
        
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stepBtn.disabled = true;
        
        playBtn.innerHTML = '<i class="fas fa-play"></i> Playing';
        
        this.animate();
    },
    
    pause() {
        console.log("⏸️ Pause clicked");
        state.isPlaying = false;
        state.isPaused = true;
        
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stepBtn.disabled = false;
        
        playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }
    },
    
    step() {
        console.log("⏭️ Step clicked");
        
        if (!state.currentAlgorithm) {
            alert('Please select an algorithm first!');
            return;
        }
        
        if (state.isCompleted) {
            this.reset();
        }
        
        // Initialize if needed
        if (Object.keys(state.algorithmState).length === 0) {
            state.algorithmState = algorithmImplementations[state.currentAlgorithm].init(state.currentArray);
            state.totalSteps = algorithmImplementations[state.currentAlgorithm].getTotalSteps(state.currentArray);
        }
        
        this.performStep();
    },
    
    reset() {
        console.log("🔄 Reset clicked");
        
        state.isPlaying = false;
        state.isPaused = false;
        state.isCompleted = false;
        state.currentStep = 0;
        state.algorithmState = {};
        
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stepBtn.disabled = false;
        
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }
        
        // Reset array and render
        state.currentArray = [...state.originalArray];
        visualizationEngine.renderArray(state.currentArray);
        
        // Reset UI
        const algoData = getAlgorithmData(state.currentAlgorithm);
        if (algoData) {
            pseudoCode.textContent = algoData.pseudoCode;
            timeComplexity.textContent = algoData.timeComplexity;
            spaceComplexity.textContent = algoData.spaceComplexity;
            algorithmExplanation.innerHTML = `<p>${algoData.explanation}</p>`;
        }
    },
    
    animate() {
        if (!state.isPlaying || state.isPaused || state.isCompleted) {
            return;
        }
        
        // Speed mapping
        const speeds = [1000, 800, 600, 400, 300, 200, 150, 100, 50, 25];
        const delay = speeds[state.animationSpeed - 1] || 300;
        
        state.timeoutId = setTimeout(() => {
            this.performStep();
            this.animate();
        }, delay);
    },
    
    performStep() {
        if (!algorithmImplementations[state.currentAlgorithm]) {
            console.error(`No implementation for ${state.currentAlgorithm}`);
            return;
        }
        
        if (state.algorithmState.isComplete) {
            state.isCompleted = true;
            state.isPlaying = false;
            playBtn.disabled = true;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            
            playBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
            return;
        }
        
        // Execute step
        state.algorithmState = algorithmImplementations[state.currentAlgorithm].next(state.algorithmState);
        state.currentStep = state.algorithmState.step;
        state.currentArray = [...state.algorithmState.array];
        
        // Check completion
        if (state.algorithmState.isComplete) {
            state.isCompleted = true;
            state.isPlaying = false;
            playBtn.disabled = true;
            pauseBtn.disabled = true;
            stepBtn.disabled = true;
            
            playBtn.innerHTML = '<i class="fas fa-check"></i> Complete';
            
            // Final highlight for sorting
            if (state.currentAlgorithm.includes('sort')) {
                setTimeout(() => {
                    visualizationEngine.renderArray(state.currentArray, {
                        sorted: Array.from({ length: state.currentArray.length }, (_, i) => i)
                    });
                }, 300);
            }
            
            console.log(`✅ Algorithm completed in ${state.currentStep} steps`);
        }
    }
};

// ========== HELPER FUNCTIONS ==========
function getAlgorithmData(algorithmId) {
    for (const category in algorithms) {
        const algo = algorithms[category].find(a => a.id === algorithmId);
        if (algo) return algo;
    }
    return null;
}

function init() {
    console.log("🚀 Initializing DSA Visualizer...");
    
    setupEventListeners();
    renderAlgorithmList();
    generateRandomArray();
    updateUI();
    
    // Auto-select first algorithm
    setTimeout(() => {
        selectAlgorithm('bubble-sort');
    }, 100);
    
    console.log("✅ DSA Visualizer ready!");
}

function setupEventListeners() {
    console.log("🔗 Setting up event listeners...");
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Array controls
    generateArrayBtn.addEventListener('click', generateRandomArray);
    arraySizeSlider.addEventListener('input', (e) => {
        arraySizeValue.textContent = e.target.value;
        generateRandomArray();
    });
    
    // Speed control
    speedControl.addEventListener('input', (e) => {
        state.animationSpeed = parseInt(e.target.value);
        updateSpeedDisplay();
    });
    
    // Control buttons
    playBtn.addEventListener('click', () => animationController.play());
    pauseBtn.addEventListener('click', () => animationController.pause());
    stepBtn.addEventListener('click', () => animationController.step());
    resetBtn.addEventListener('click', () => animationController.reset());
    
    console.log("✅ Event listeners set up");
}

function renderAlgorithmList() {
    console.log("📋 Rendering algorithm list...");
    
    const categories = document.querySelectorAll('.category');
    
    categories.forEach((category, index) => {
        const title = category.querySelector('.category-title').textContent.toLowerCase();
        const itemsContainer = category.querySelector('.algorithm-items');
        
        let algorithmList = [];
        
        if (title.includes('sorting')) {
            algorithmList = algorithms.sorting || [];
        } else if (title.includes('searching')) {
            algorithmList = algorithms.searching || [];
        } 
        // ⚠️ REMOVE THESE CONDITIONS - THEY DON'T EXIST ANYMORE
        // else if (title.includes('graph')) {
        //     algorithmList = algorithms.graph || [];
        // } else if (title.includes('linked')) {
        //     algorithmList = algorithms.linkedlist || [];
        // }
        
        itemsContainer.innerHTML = '';
        
        algorithmList.forEach(algo => {
            const li = document.createElement('li');
            li.className = 'algorithm-item';
            li.dataset.id = algo.id;
            li.innerHTML = `
                <i class="${algo.icon}"></i>
                <span>${algo.name}</span>
            `;
            
            li.addEventListener('click', () => {
                console.log(`👉 Selected: ${algo.name}`);
                selectAlgorithm(algo.id);
            });
            
            itemsContainer.appendChild(li);
        });
    });
    
    console.log("✅ Algorithm list rendered");
}

function selectAlgorithm(algorithmId) {
    console.log(`🎯 Selecting algorithm: ${algorithmId}`);
    
    // Update UI
    document.querySelectorAll('.algorithm-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.algorithm-item[data-id="${algorithmId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Update state
    state.currentAlgorithm = algorithmId;
    state.currentStep = 0;
    state.algorithmState = {};
    state.isCompleted = false;
    
    // Get algorithm data
    const algoData = getAlgorithmData(algorithmId);
    if (algoData) {
        algorithmTitle.textContent = algoData.name;
        pseudoCode.textContent = algoData.pseudoCode;
        timeComplexity.textContent = algoData.timeComplexity;
        spaceComplexity.textContent = algoData.spaceComplexity;
        algorithmExplanation.innerHTML = `<p>${algoData.explanation}</p>`;
    }
    
    // Reset visualization
    animationController.reset();
    
    console.log(`✅ Selected: ${algoData?.name || algorithmId}`);
}

function generateRandomArray() {
    console.log("🎲 Generating random array...");
    
    const size = parseInt(arraySizeSlider.value);
    state.currentArray = [];
    
    for (let i = 0; i < size; i++) {
        state.currentArray.push(Math.floor(Math.random() * 90) + 10);
    }
    
    state.originalArray = [...state.currentArray];
    
    // Render the array
    visualizationEngine.renderArray(state.currentArray);
    
    console.log(`✅ Generated array: [${state.currentArray.join(', ')}]`);
}

function updateSpeedDisplay() {
    let speedText = 'Slow';
    if (state.animationSpeed > 7) speedText = 'Fast';
    else if (state.animationSpeed > 3) speedText = 'Medium';
    
    speedValue.textContent = speedText;
    console.log(`🎚️ Speed set to: ${speedText} (${state.animationSpeed})`);
}

function toggleTheme() {
    const icon = themeToggle.querySelector('i');
    
    if (icon.classList.contains('fa-moon')) {
        // Switch to light theme
        document.documentElement.style.setProperty('--bg-primary', '#f8fafc');
        document.documentElement.style.setProperty('--bg-secondary', '#e2e8f0');
        document.documentElement.style.setProperty('--bg-tertiary', '#cbd5e1');
        document.documentElement.style.setProperty('--text-primary', '#1e293b');
        document.documentElement.style.setProperty('--text-secondary', '#475569');
        document.documentElement.style.setProperty('--text-muted', '#64748b');
        
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        console.log("🌞 Switched to light theme");
    } else {
        // Switch back to dark theme
        document.documentElement.style.setProperty('--bg-primary', '#0f172a');
        document.documentElement.style.setProperty('--bg-secondary', '#1e293b');
        document.documentElement.style.setProperty('--bg-tertiary', '#334155');
        document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e1');
        document.documentElement.style.setProperty('--text-muted', '#94a3b8');
        
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        console.log("🌙 Switched to dark theme");
    }
}

function updateUI() {
    updateSpeedDisplay();
}

// ========== START APPLICATION ==========
document.addEventListener('DOMContentLoaded', init);