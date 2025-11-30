"use client";

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import gsap from 'gsap';

const GAME_CONFIG = {
  SCENE: { WIDTH: 600, HEIGHT: 650 },
  CENTER: { X: 300, Y: 280 },

  COLORS: {
    BACKGROUND: 0x050505, 
    GRID: 0xFFFFFF,       
    GRID_ALPHA: 0.05,     
  },

  RIM_STYLE: {
    VISIBLE: true,
    RADIUS: 220,
    THICKNESS: 25,
    COLOR: 0x222222,
    BLOCKS_COUNT: 48,
    BLOCK_COLOR: 0x555555,
    BLOCK_WIDTH: 7,
    BLOCK_HEIGHT: 14,
  },

  SECTORS: {
    INNER_RADIUS: 0,
    OUTER_RADIUS: 215,
    TEXT_RADIUS: 160,
    STROKE_COLOR: 0xFFFFFF,
    STROKE_WIDTH: 2,
    STROKE_ALPHA: 0.8,
  },

  GRAPHICS: {
    POINTER: { WIDTH: 45, HEIGHT: 55, OFFSET_X: 0, OFFSET_Y: 18 },
    BUTTON: { WIDTH: 140, HEIGHT: 60, OFFSET_X: 0, OFFSET_Y: 120 }
  },

  CENTER_CAP: {
    VISIBLE: true, RADIUS: 25, COLOR: 0x151515, BORDER_COLOR: 0x888888, BORDER_WIDTH: 2,
  },

  TEXT: {
    FONT_SIZE: 20, FONT_FAMILY: 'Arial', COLOR: '#ffffff', BOLD: true, STROKE_THICKNESS: 0, ROTATE_TEXT: true,
  },

  ANIMATION: {
    DURATION: 12,
    SPINS: 10,
    EASE: 'power4.out',
  },

  TICKER: {
    ANGLE: 15,
    BASE_DURATION: 0.1,
  },

  PRIZES: [
    { id: 1, text: '0.01ETH', color: 0x252525 },
    { id: 2, text: 'BONUS',   color: 0x3d3d3d },
    { id: 3, text: 'TICKET',  color: 0x252525 },
    { id: 4, text: 'EMPTY',   color: 0x3d3d3d },
    { id: 5, text: '0.05ETH', color: 0x252525 },
    { id: 6, text: 'SPIN',    color: 0x3d3d3d },
    { id: 7, text: 'NFT',     color: 0x252525 },
    { id: 8, text: 'JACKPOT', color: 0x3d3d3d },
  ],
};

interface FortuneWheelProps {
  onWin?: (prize: string) => void;
  className?: string;
}

export default function FortuneWheel({ onWin, className = '' }: FortuneWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const rootRef = useRef<PIXI.Container | null>(null);
  const spinLayerRef = useRef<PIXI.Container | null>(null);
  const pointerSpriteRef = useRef<PIXI.Sprite | null>(null);
  const buttonRef = useRef<PIXI.Sprite | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    let app: PIXI.Application;

    const initApp = async () => {
      try {
        app = new PIXI.Application();
        appRef.current = app;

        await app.init({
          width: GAME_CONFIG.SCENE.WIDTH,
          height: GAME_CONFIG.SCENE.HEIGHT,
          backgroundColor: GAME_CONFIG.COLORS.BACKGROUND,
          backgroundAlpha: 1,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });

        // Initialize Audio Context
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        } catch (e) {
          console.error('Audio API Error', e);
        }

        if (containerRef.current) {
          containerRef.current.appendChild(app.canvas);
        }

        // Load assets and setup scene
        try {
          const [ptr, btn] = await Promise.all([
            PIXI.Assets.load('/pointer.png'),
            PIXI.Assets.load('/button.png'),
          ]);
          setupScene(app, { pointer: ptr, button: btn });
        } catch (error) {
          console.error('Failed to load assets:', error);
          setupScene(app, { pointer: null, button: null });
        }
      } catch (error) {
        console.error('Failed to initialize PIXI app:', error);
      }
    };

    initApp();

    return () => {
      if (app) {
        try {
          app.destroy(true);
        } catch (error) {
          console.warn('PIXI app destroy error:', error);
        }
      }
    };
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="border corner-accents bg-accent/5 text-accent px-4 py-3">
          <span className="text-sm font-bold">Loading Fortune Wheel...</span>
        </div>
      </div>
    );
  }

  const setupScene = (app: PIXI.Application, assets: any) => {
    const root = new PIXI.Container();
    rootRef.current = root;
    app.stage.addChild(root);

    // Grid Background
    const gridG = new PIXI.Graphics();
    gridG.beginPath();
    const gridSize = 75;
    
    for (let x = 0; x <= GAME_CONFIG.SCENE.WIDTH; x += gridSize) {
      gridG.moveTo(x, 0);
      gridG.lineTo(x, GAME_CONFIG.SCENE.HEIGHT);
    }
    for (let y = 0; y <= GAME_CONFIG.SCENE.HEIGHT; y += gridSize) {
      gridG.moveTo(0, y);
      gridG.lineTo(GAME_CONFIG.SCENE.WIDTH, y);
    }
    gridG.stroke({ width: 1, color: GAME_CONFIG.COLORS.GRID, alpha: GAME_CONFIG.COLORS.GRID_ALPHA });
    root.addChild(gridG);

    // Main wheel container
    const mainWheelWrapper = new PIXI.Container();
    mainWheelWrapper.position.set(GAME_CONFIG.CENTER.X, GAME_CONFIG.CENTER.Y);
    root.addChild(mainWheelWrapper);

    // Shadow effect
    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, 0, 240, 240);
    shadow.fill({ color: 0x000000, alpha: 0.5 });
    mainWheelWrapper.addChild(shadow);

    // Spinning layer
    const spinLayer = new PIXI.Container();
    spinLayerRef.current = spinLayer;
    mainWheelWrapper.addChild(spinLayer);

    // Create sectors
    const sectorsCfg = GAME_CONFIG.SECTORS;
    const sectorAngle = (Math.PI * 2) / GAME_CONFIG.PRIZES.length;
    const startRotation = -Math.PI / 2;

    GAME_CONFIG.PRIZES.forEach((prize, index) => {
      const start = startRotation + index * sectorAngle;
      const end = start + sectorAngle;

      const g = new PIXI.Graphics();
      
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, sectorsCfg.OUTER_RADIUS, start, end);
      g.lineTo(0, 0);
      g.closePath();
      g.fill({ color: prize.color });
      
      g.stroke({
        width: sectorsCfg.STROKE_WIDTH,
        color: sectorsCfg.STROKE_COLOR,
        alpha: sectorsCfg.STROKE_ALPHA
      });

      const textStyle = new PIXI.TextStyle({
        fontFamily: GAME_CONFIG.TEXT.FONT_FAMILY,
        fontSize: GAME_CONFIG.TEXT.FONT_SIZE,
        fill: GAME_CONFIG.TEXT.COLOR,
        fontWeight: 'bold',
      });

      const text = new PIXI.Text({ text: prize.text, style: textStyle });
      text.anchor.set(0.5);

      const mid = (start + end) / 2;
      text.position.set(
        Math.cos(mid) * sectorsCfg.TEXT_RADIUS,
        Math.sin(mid) * sectorsCfg.TEXT_RADIUS
      );

      if (GAME_CONFIG.TEXT.ROTATE_TEXT) {
        text.rotation = mid + Math.PI;
      }

      const segmentContainer = new PIXI.Container();
      segmentContainer.addChild(g);
      segmentContainer.addChild(text);
      spinLayer.addChild(segmentContainer);
    });

    // Rim with teeth
    const rimParams = GAME_CONFIG.RIM_STYLE;
    if (rimParams.VISIBLE) {
      const rimBase = new PIXI.Graphics();
      rimBase.beginPath();
      rimBase.arc(0, 0, rimParams.RADIUS + rimParams.THICKNESS / 2, 0, Math.PI * 2);
      rimBase.stroke({ width: rimParams.THICKNESS, color: rimParams.COLOR });
      spinLayer.addChild(rimBase);

      const teethContainer = new PIXI.Container();
      spinLayer.addChild(teethContainer);
      const blocks = rimParams.BLOCKS_COUNT;
      const blockAngleStep = (Math.PI * 2) / blocks;
      for(let i=0; i<blocks; i++) {
          if (i % 2 !== 0) continue; 
          const tooth = new PIXI.Graphics();
          tooth.rect(-rimParams.BLOCK_WIDTH / 2, -rimParams.BLOCK_HEIGHT / 2, rimParams.BLOCK_WIDTH, rimParams.BLOCK_HEIGHT);
          tooth.fill({ color: rimParams.BLOCK_COLOR });
          const angle = i * blockAngleStep;
          const radius = rimParams.RADIUS + rimParams.THICKNESS / 2;
          tooth.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius);
          tooth.rotation = angle + Math.PI / 2; 
          teethContainer.addChild(tooth);
      }
    }

    // Center cap
    if (GAME_CONFIG.CENTER_CAP.VISIBLE) {
      const cap = new PIXI.Graphics();
      cap.beginPath();
      cap.arc(0, 0, GAME_CONFIG.CENTER_CAP.RADIUS, 0, Math.PI * 2);
      cap.fill({ color: GAME_CONFIG.CENTER_CAP.COLOR });
      cap.stroke({
        width: GAME_CONFIG.CENTER_CAP.BORDER_WIDTH,
        color: GAME_CONFIG.CENTER_CAP.BORDER_COLOR
      });
      spinLayer.addChild(cap);
    }

    // Pointer
    if (assets && assets.pointer) {
      const pointerSprite = new PIXI.Sprite(assets.pointer);
      pointerSpriteRef.current = pointerSprite;
      pointerSprite.anchor.set(0.5, 1);
      pointerSprite.rotation = Math.PI;
      
      pointerSprite.width = GAME_CONFIG.GRAPHICS.POINTER.WIDTH;
      pointerSprite.height = GAME_CONFIG.GRAPHICS.POINTER.HEIGHT;

      const ptrY = -(GAME_CONFIG.SECTORS.OUTER_RADIUS + GAME_CONFIG.GRAPHICS.POINTER.OFFSET_Y);
      const ptrX = GAME_CONFIG.GRAPHICS.POINTER.OFFSET_X;
      
      pointerSprite.position.set(ptrX, ptrY);
      mainWheelWrapper.addChild(pointerSprite);
    }

    // Button
    if (assets && assets.button) {
      const button = new PIXI.Sprite(assets.button);
      buttonRef.current = button;
      button.anchor.set(0.5);
      
      button.width = GAME_CONFIG.GRAPHICS.BUTTON.WIDTH;
      button.height = GAME_CONFIG.GRAPHICS.BUTTON.HEIGHT;

      const btnY = GAME_CONFIG.SECTORS.OUTER_RADIUS + GAME_CONFIG.GRAPHICS.BUTTON.OFFSET_Y;
      const btnX = GAME_CONFIG.GRAPHICS.BUTTON.OFFSET_X;

      button.position.set(btnX, btnY);
      button.eventMode = 'static';
      button.cursor = 'pointer';
      button.on('pointerdown', () => startSpin());
      mainWheelWrapper.addChild(button);
    } else {
      // Fallback button if asset loading fails
      const button = new PIXI.Graphics();
      button.beginPath();
      button.roundRect(-70, -30, 140, 60, 12);
      button.fill({ color: 0x4CAF50 });
      button.stroke({ width: 2, color: 0x2E7D32 });
      
      const buttonText = new PIXI.Text({ 
        text: 'SPIN', 
        style: new PIXI.TextStyle({
          fontFamily: 'Arial',
          fontSize: 24,
          fill: '#ffffff',
          fontWeight: 'bold',
        })
      });
      buttonText.anchor.set(0.5);
      
      button.addChild(buttonText);
      button.position.set(0, GAME_CONFIG.SECTORS.OUTER_RADIUS + GAME_CONFIG.GRAPHICS.BUTTON.OFFSET_Y);
      button.eventMode = 'static';
      button.cursor = 'pointer';
      button.on('pointerdown', () => startSpin());
      
      mainWheelWrapper.addChild(button);
      buttonRef.current = button as any;
    }
  };

  const startSpin = () => {
    if (!spinLayerRef.current || !buttonRef.current) return;

    // Audio context resume
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const btn = buttonRef.current;
    btn.eventMode = 'none';
    btn.alpha = 0.5;

    const prizes = GAME_CONFIG.PRIZES;
    const winningIndex = Math.floor(Math.random() * prizes.length);
    console.log('Win:', prizes[winningIndex].text);
    
    const sectorCount = prizes.length;
    const sectorAngle = (Math.PI * 2) / sectorCount;
    const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.4);
    const targetRotation = GAME_CONFIG.ANIMATION.SPINS * Math.PI * 2 
                           - (winningIndex * sectorAngle + sectorAngle / 2) 
                           + randomOffset;

    let previousSectorIndex = -1;
    let lastRotation = spinLayerRef.current.rotation;

    gsap.to(spinLayerRef.current, {
      rotation: targetRotation,
      duration: GAME_CONFIG.ANIMATION.DURATION,
      ease: GAME_CONFIG.ANIMATION.EASE,
      
      onUpdate: function() {
        if (!spinLayerRef.current) return;
        
        const currentRot = spinLayerRef.current.rotation;
        const velocity = Math.abs(currentRot - lastRotation);
        lastRotation = currentRot;

        let normalizedRot = currentRot % (Math.PI * 2);
        if (normalizedRot < 0) normalizedRot += Math.PI * 2;
        const pointerOffset = Math.PI / 2;
        const rawIndex = Math.floor((normalizedRot + pointerOffset) / sectorAngle);
        const currentIndex = rawIndex % sectorCount;

        if (currentIndex !== previousSectorIndex) {
            if (previousSectorIndex !== -1) {
                triggerTick(velocity);
            }
            previousSectorIndex = currentIndex;
        }
      },

      onComplete: () => {
        if (!spinLayerRef.current) return;
        
        spinLayerRef.current.rotation = targetRotation % (Math.PI * 2);
        btn.eventMode = 'static';
        btn.alpha = 1;
        
        const winningPrize = prizes[winningIndex].text;
        if (onWin) {
          onWin(winningPrize);
        }
      },
    });
  };

  const triggerTick = (velocity: number) => {
    const intensity = Math.min(Math.max(velocity * 8, 0.1), 1);

    if (audioCtxRef.current) {
      playProceduralClick(intensity);
    }

    if (pointerSpriteRef.current) {
      gsap.killTweensOf(pointerSpriteRef.current);
      const baseRotation = Math.PI;
      const dynamicAngle = GAME_CONFIG.TICKER.ANGLE * intensity;
      const kickAngleRad = (dynamicAngle * Math.PI) / 180;
      const duration = Math.max(GAME_CONFIG.TICKER.BASE_DURATION / (intensity * 2 + 0.5), 0.04);

      const tl = gsap.timeline();
      tl.to(pointerSpriteRef.current, {
        rotation: baseRotation - kickAngleRad, 
        duration: duration * 0.3, 
        ease: 'power1.out',
      })
      .to(pointerSpriteRef.current, {
        rotation: baseRotation, 
        duration: duration * 0.7,
        ease: 'elastic.out(1, 0.5)',
      });
    }
  };

  const playProceduralClick = (intensity: number) => {
    if (!audioCtxRef.current) return;

    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    const baseFreq = 100;
    const maxFreqAdd = 500;
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq + (maxFreqAdd * intensity), audioCtxRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, audioCtxRef.current.currentTime + 0.1);

    const volume = intensity * 0.8; 
    gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);

    osc.start(audioCtxRef.current.currentTime);
    osc.stop(audioCtxRef.current.currentTime + 0.1);
  };

  return (
    <div className={`fortune-wheel-container ${className}`}>
      <div ref={containerRef} className="w-full flex justify-center items-center" />
    </div>
  );
}