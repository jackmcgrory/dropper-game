import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Runner, Body, Events } from 'matter-js';
import './PlinkoDropper.css';

const PlinkoDropper = ({ labels = [], initialCols = 30, initialRows = 8, bucketHeight = 1, ballSize = 8}) => {
  const canvasRef = useRef();
  const engineRef = useRef(Engine.create());
  const renderRef = useRef();
  const runnerRef = useRef();
  const grainList = [];
  const bucketTops = [];
  
  const baseWidth = 1200;

 const colourList = ['#EC79EE', '#BA75FE', '#728FFF', '#33B6FF', '#34E1A5','#ea2431' ];
  const teamList = ['Heritage', 'Protection', 'Waterfront','Retirement', 'Workplace', 'General Insurance'];
  const timeList = ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];
  var totalNumberOfBalls = 0;

  useEffect(() => {
    initializeRenderer();
    window.addEventListener('resize', handleResize);
    return () => {
      clearRenderer();
      window.removeEventListener('resize', handleResize);
    };
  }, [ bucketHeight, initialCols, initialRows, ballSize]);

  const handleResize = () => {
    clearRenderer();
    initializeRenderer();
  };

  const initializeRenderer = () => {
    if (!canvasRef.current) return;
    const height = canvasRef.current.offsetHeight;
    const width = canvasRef.current.offsetWidth;

    renderRef.current = Render.create({
      element: canvasRef.current,
      engine: engineRef.current,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#EDE9FF',
      },
    });

    // Draw horizontal stacking lines
  const drawStackingLines = () => {
    const ctx = renderRef.current.context;
    ctx.strokeStyle = '#BBBBBB'; // Line color
    ctx.lineWidth = 1; // Line thickness

    const ballRadius = ballSize * width / baseWidth;
    const stackingStartY = height - 220; // Starting position for the stack lines
    for (let i = 0; i < 10; i++) { // Draw 10 lines for stacking
      const lineY = stackingStartY - i * (2 * ballRadius); // Spacing by ball diameter
      ctx.beginPath();
      ctx.moveTo(0, lineY); // Line starts at the left edge
      ctx.lineTo(width, lineY); // Line ends at the right edge
      ctx.stroke();
    }
  };

  // Draw stacking lines after the renderer updates
  Render.run(renderRef.current);
  drawStackingLines();

    const ground = Bodies.rectangle(width / 2, height + 20, width, 40, { isStatic: true, friction: 10 });
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height * 2, { isStatic: true, friction: 10 });
    const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height * 2, { isStatic: true, friction: 10 });
    
    // Funnel walls positioned at the bottom to guide balls into a tunnel
    const funnelLeft = Bodies.rectangle(width * 0.479, height - 88, 20, 200, { 
      isStatic: true, 
      render: { fillStyle: '#26434B' }, 
      friction: 10 
    });
    
    const funnelRight = Bodies.rectangle(width * 0.521, height - 88, 20, 200, { 
      isStatic: true, 
      render: { fillStyle: '#26434B' }, 
      friction: 10 
    });
    

    // Add diagonal walls for funneling
  const funnelWidth = width * 0.8; // Width of the funnel
  const diagonalWallLeft = Bodies.rectangle(
    ((width - funnelWidth) / 2) + 100, // Left starting point
    (height / 2) - 150  , 
    funnelWidth + 49, 
    20, 
    { 
      isStatic: true, 
      angle: Math.PI / 4, // Diagonal left slope
      render: { fillStyle: '#26434B' } 
    }
  );
  const diagonalWallRight = Bodies.rectangle(
    (width - (width - funnelWidth) / 2) -100, // Right starting point
    (height / 2) - 150 , 
    funnelWidth + 49, 
    20, 
    { 
      isStatic: true, 
      angle: -Math.PI / 4, // Diagonal right slope
      render: { fillStyle: '#26434B' } 
    }
  );


  // Add a sensor below the funnel
  const sensor = Bodies.rectangle(width / 2, height -200, width * 0.5, 10, { 
    isStatic: true, 
    isSensor: true, // Sensor for collision detection
    render: { fillStyle: 'transparent' } 
  });

    const spacingX = width / initialCols;
    const spacingY = (height * 0.8) / (initialRows + 2);
    const pegs = [];
    for (let row = 1; row <= initialRows; row++) {
      for (let col = 0; col < initialCols; col++) {
        if ((row % 2 === 0 && col % 2 === 1) || (row % 2 === 1 && col % 2 === 0)) {
          const peg = Bodies.circle(spacingX * col, spacingY * row, 3 * width / baseWidth, { isStatic: true , restitution: 1.2});
          pegs.push(peg);
        }
      }
    }

    World.add(engineRef.current.world, [ground, leftWall, rightWall, ...pegs, diagonalWallLeft, diagonalWallRight, funnelLeft, funnelRight, sensor]);
    Runner.run(engineRef.current);
    Render.run(renderRef.current);

    runnerRef.current = Runner.create();
    Runner.run(runnerRef.current, engineRef.current);

    Events.on(engineRef.current, 'collisionStart', event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
  
        // Check if the ball has collided with the sensor
        if (bodyA === sensor || bodyB === sensor) {
          const ball = bodyA === sensor ? bodyB : bodyA;
  
          // Modify ball properties to reduce bounciness and increase weight
          Body.set(ball, {
            restitution: 0.1, // Reduce bounciness
            density: 5.0,    // Increase weight
          });
  
          console.log('Ball properties updated: Less bouncy and heavier');
        }
      });
    });

    pegs.forEach((peg, index) => {
      const row = Math.floor(index / initialCols);
      movePeg(peg, row % 2 === 0 ? 1 : -1);
    });
  };

  const movePeg = (peg, direction) => {
    const amplitude = 100;
    const move = () => {
      Body.translate(peg, { x: direction, y: 0 });
      if (peg.position.x > peg.initialX + amplitude || peg.position.x < peg.initialX - amplitude) {
        direction *= -1;
      }
      requestAnimationFrame(move);
    };
    peg.initialX = peg.position.x;
    move();
  };

  const addGrain = () => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.offsetWidth;
    const x = Math.random() * width;
    const jitter = (Math.random() - 0.5) * 100;  
    const grainColor = colourList[totalNumberOfBalls % colourList.length];
    let grain = Bodies.circle(x, jitter, ballSize * width / baseWidth, {
      friction: 0.05,
      restitution: 1.1,
      density: 0.001,
      render: {
        fillStyle: grainColor,
      }
    });
 if (totalNumberOfBalls == 5){
      grain = Bodies.circle(width/2, canvasRef.current.offsetHeight, ballSize * width / baseWidth, {
        friction: 0.05,
        restitution: 0.1,
        density: 5.0,
        render: {
          fillStyle: grainColor,
        }
      });
    } 

    grainList.push(grain);
    World.add(engineRef.current.world, grain);
  };

  const dropBalls = () => {
    for(var i = 0; i < 6; i++){
      totalNumberOfBalls++;
      addGrain();
    }
      console.log("totalnum balls " + totalNumberOfBalls);
  };

  const clearRenderer = () => {
    if (!renderRef.current) return;
    Render.stop(renderRef.current);
    Runner.stop(runnerRef.current);
    renderRef.current.canvas.remove();
    if (!engineRef.current) return;
    World.clear(engineRef.current.world);
    Engine.clear(engineRef.current);
  };

  return (
    <div className="plinko-dropper-container">
         <div className="color-guide">
        {colourList.map((color, index) => (
          <div key={index} className="color-guide-item" style={{ backgroundColor: color }}>
            {teamList[index]}
          </div>
        ))}
      </div>
      <div className="dropper-and-labels-container">
      <div className="bucket-labels">
          {timeList.map((label, index) => (
            <div key={index} className="bucket-label" style={{ width: `${100 / timeList.length}%` }}>
              {label}
            </div>
          ))}
        </div>
        <div ref={canvasRef} onMouseDown={dropBalls} className="dropper-canvas" />
      </div>
    </div>
  );
};

export default PlinkoDropper;
