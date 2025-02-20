import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Runner, Body, Events } from 'matter-js';
import './PlinkoDropper.css';

const PlinkoDropper = ({ labels = [], initialCols = 30, initialRows = 8, bucketHeight = 1, ballSize = 8 }) => {
  const canvasRef = useRef();
  const engineRef = useRef(Engine.create());
  const renderRef = useRef();
  const runnerRef = useRef();
  const grainList = [];
  const bucketTops = [];

  const baseWidth = 1200;

  const colourList = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFF5', '#FCBA03'];
  const [totalNumberOfBalls, setTotalNumberOfBalls] = useState(0);
  const [shuffledLabels, setShuffledLabels] = useState(labels);
  const [bucketStatus, setBucketStatus] = useState(new Array(labels.length).fill(true)); // Track bucket status

  useEffect(() => {
    initializeRenderer();
    window.addEventListener('resize', handleResize);
    return () => {
      clearRenderer();
      window.removeEventListener('resize', handleResize);
    };
  }, [shuffledLabels, bucketHeight, initialCols, initialRows, ballSize]);

  useEffect(() => {
    // reset 
    setShuffledLabels(labels);
    setBucketStatus(new Array(labels.length).fill(true));
    setTotalNumberOfBalls(0);
  }, [labels]);

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
        background: '#BBBBBB',
      },
    });

    const ground = Bodies.rectangle(width / 2, height + 20, width, 40, { isStatic: true, friction: 10 });
    const leftWall = Bodies.rectangle(-10, height / 2, 20, height * 2, { isStatic: true, friction: 10 });
    const rightWall = Bodies.rectangle(width + 10, height, 20, height * 2, { isStatic: true, friction: 10 });

    const bucketWidth = width / shuffledLabels.length;
    const bucketWalls = [];
    const bottomWalls = [];
    for (let i = 0; i <= shuffledLabels.length; i++) {
      const bucketWall = Bodies.rectangle(bucketWidth * i, height, 10 * width / baseWidth, 350 * bucketHeight, { isStatic: true, friction: 10 });
      const bottomWall = Bodies.rectangle(bucketWidth * (i + 0.5), height - 10, bucketWidth, 10, { isStatic: true, isSensor: false });
      bucketWalls.push(bucketWall);
      bottomWalls.push(bottomWall);
    }

    const spacingX = width / initialCols;
    const spacingY = (height * 0.8) / (initialRows + 2);
    const pegs = [];
    for (let row = 1; row <= initialRows; row++) {
      for (let col = 0; col < initialCols; col++) {
        if ((row % 2 === 0 && col % 2 === 1) || (row % 2 === 1 && col % 2 === 0)) {
          const peg = Bodies.circle(spacingX * col, spacingY * row, 3 * width / baseWidth, { isStatic: true });
          pegs.push(peg);
        }
      }
    }

    World.add(engineRef.current.world, [ground, leftWall, rightWall, ...bucketWalls, ...bottomWalls, ...pegs]);
    Runner.run(engineRef.current);
    Render.run(renderRef.current);

    runnerRef.current = Runner.create();
    Runner.run(runnerRef.current, engineRef.current);

    Events.on(engineRef.current, 'collisionStart', event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        console.log("number of grains is " + grainList.length);
        bottomWalls.forEach((wall, index) => {
          if ((bodyA === wall && bucketStatus[index]) || (bodyB === wall && bucketStatus[index])) {
            // Place a wall on top of the bucket
            const bucketWidth = canvasRef.current.offsetWidth / shuffledLabels.length;
            const topWall = Bodies.rectangle(bucketWidth * (index + 0.5), height - 170, bucketWidth, 10, { isStatic: true, force: 0.00000001 });
            bucketTops.push(topWall);
            World.add(engineRef.current.world, topWall);
            bucketStatus[index] = false;
            setBucketStatus([...bucketStatus]);

            // Make the colliding ball static and disable its collision response
            const ball = bodyA === wall ? bodyB : bodyA;
            Body.setStatic(ball, true);
            ball.collisionFilter = { group: -1, category: 0, mask: 0 };


            // Check if all the buckets are closed - if so, open again
            if (bucketTops.length === labels.length) {
              bucketTops.forEach((lid, index) => {
                World.remove(engineRef.current.world, lid);
                bucketStatus[index] = true;
                setBucketStatus([...bucketStatus]);
              });
              bucketTops.length = 0;
            }
          }
        });
      });
    });


    Events.on(engineRef.current, 'collisionStart', event => {
        event.pairs.forEach(pair => {
          const { bodyA, bodyB } = pair;
          bucketTops.forEach((wall, index) => {
            if (wall && (bodyA === wall || bodyB === wall)) {
              // Move the ball back to the top
              const ball = bodyA === wall ? bodyB : bodyA;
              Body.setPosition(ball, { x: Math.random() * canvasRef.current.offsetWidth, y: 0 });
            }
          });
        });
      });

    pegs.forEach((peg, index) => {
      const row = Math.floor(index / initialCols);
      movePeg(peg, row % 2 === 0 ? 1 : -1);
    });
  };

  const movePeg = (peg, direction) => {
    const amplitude = 10;
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
    const grain = Bodies.circle(x, jitter, ballSize * width / baseWidth, {
      friction: 0.05,
      restitution: 0.6,
      density: 0.001,
      render: {
        fillStyle: grainColor,
      }
    });
    console.log("adding grain");
    grainList.push(grain);
    World.add(engineRef.current.world, grain);
  };

  const dropBalls = () => {
      setTotalNumberOfBalls(totalNumberOfBalls+1);
      addGrain();
      console.log("totalnum balls " + totalNumberOfBalls);
  };

  const shuffleLabels = () => {
    const newShuffledLabels = [...shuffledLabels].sort(() => Math.random() - 0.5);
    setShuffledLabels(newShuffledLabels);
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
      <div className="dropper-and-labels-container">
        <div ref={canvasRef} onMouseDown={dropBalls} className="dropper-canvas" />
        <div className="bucket-labels">
          {shuffledLabels.map((label, index) => (
            <div key={index} className="bucket-label" style={{ width: `${100 / shuffledLabels.length}%` }}>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div className="color-guide">
        {colourList.map((color, index) => (
          <div key={index} className="color-guide-item" style={{ backgroundColor: color }}>
            Team {index + 1}
          </div>
        ))}
      </div>
      <div className="control-padding"></div>
      <div className="controls">
        <button onClick={dropBalls} className='button'>Drop Ball</button>
        <button onClick={shuffleLabels} className='button'>Shuffle Labels</button>
      </div>
    </div>
  );
};

export default PlinkoDropper;