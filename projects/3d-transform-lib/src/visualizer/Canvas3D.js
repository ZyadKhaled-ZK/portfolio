// src/visualizer/Canvas3D.js
import Vector3 from '../core/Vector3.js';
import MathUtils from '../utils/MathUtils.js';

/**
 * Simple 3D Canvas Renderer
 */
class Canvas3D {
  constructor(canvasId, width = 800, height = 600) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.fov = 500;
    this.viewDistance = 5;
    this.backgroundColor = '#1a1a2e';
    this.gridColor = '#16213e';
    this.axisColors = {
      x: '#ff6b6b',
      y: '#4ecdc4',
      z: '#45b7d1'
    };
  }

  // Clear canvas
  clear() {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Project 3D point to 2D screen space
  project(point) {
    const projected = MathUtils.project3DTo2D(
      point.x,
      point.y,
      point.z,
      this.fov,
      this.viewDistance
    );
    
    return {
      x: projected.x + this.width / 2,
      y: -projected.y + this.height / 2,
      scale: projected.scale
    };
  }

  // Draw a point
  drawPoint(point, color = '#ffffff', size = 5) {
    const p = this.project(point);
    
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, size * p.scale, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Draw a line
  drawLine(start, end, color = '#ffffff', width = 2) {
    const p1 = this.project(start);
    const p2 = this.project(end);
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }

  // Draw multiple connected points (path)
  drawPath(points, color = '#ffffff', width = 2, closed = false) {
    if (points.length < 2) return;
    
    const projected = points.map(p => this.project(p));
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(projected[0].x, projected[0].y);
    
    for (let i = 1; i < projected.length; i++) {
      this.ctx.lineTo(projected[i].x, projected[i].y);
    }
    
    if (closed) {
      this.ctx.closePath();
    }
    
    this.ctx.stroke();
  }

  // Draw coordinate axes
  drawAxes(length = 2) {
    const origin = new Vector3(0, 0, 0);
    
    // X axis (red)
    this.drawLine(origin, new Vector3(length, 0, 0), this.axisColors.x, 3);
    
    // Y axis (cyan)
    this.drawLine(origin, new Vector3(0, length, 0), this.axisColors.y, 3);
    
    // Z axis (blue)
    this.drawLine(origin, new Vector3(0, 0, length), this.axisColors.z, 3);
    
    // Draw axis labels
    this.drawAxisLabel(new Vector3(length + 0.2, 0, 0), 'X', this.axisColors.x);
    this.drawAxisLabel(new Vector3(0, length + 0.2, 0), 'Y', this.axisColors.y);
    this.drawAxisLabel(new Vector3(0, 0, length + 0.2), 'Z', this.axisColors.z);
  }

  // Draw axis label
  drawAxisLabel(point, text, color) {
    const p = this.project(point);
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText(text, p.x, p.y);
  }

  // Draw a 3D grid
  drawGrid(size = 4, divisions = 8) {
    const step = size / divisions;
    const half = size / 2;
    
    // Draw grid lines parallel to X axis
    for (let i = 0; i <= divisions; i++) {
      const y = -half + i * step;
      this.drawLine(
        new Vector3(-half, y, 0),
        new Vector3(half, y, 0),
        this.gridColor,
        1
      );
    }
    
    // Draw grid lines parallel to Y axis
    for (let i = 0; i <= divisions; i++) {
      const x = -half + i * step;
      this.drawLine(
        new Vector3(x, -half, 0),
        new Vector3(x, half, 0),
        this.gridColor,
        1
      );
    }
  }

  // Draw a cube wireframe
  drawCube(points, color = '#00ff88', width = 2) {
    // Bottom face
    this.drawPath([points[0], points[1], points[2], points[3]], color, width, true);
    
    // Top face
    this.drawPath([points[4], points[5], points[6], points[7]], color, width, true);
    
    // Vertical edges
    this.drawLine(points[0], points[4], color, width);
    this.drawLine(points[1], points[5], color, width);
    this.drawLine(points[2], points[6], color, width);
    this.drawLine(points[3], points[7], color, width);
  }

  // Draw text on canvas
  drawText(text, x, y, color = '#ffffff', size = 14) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.fillText(text, x, y);
  }

  // Create default cube vertices
  static createCubeVertices(size = 1) {
    const s = size / 2;
    return [
      new Vector3(-s, -s, -s), // 0: bottom-front-left
      new Vector3(s, -s, -s),  // 1: bottom-front-right
      new Vector3(s, s, -s),   // 2: bottom-back-right
      new Vector3(-s, s, -s),  // 3: bottom-back-left
      new Vector3(-s, -s, s),  // 4: top-front-left
      new Vector3(s, -s, s),   // 5: top-front-right
      new Vector3(s, s, s),    // 6: top-back-right
      new Vector3(-s, s, s)    // 7: top-back-left
    ];
  }
}

export default Canvas3D;