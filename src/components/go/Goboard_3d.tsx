import type { BoardPoint } from './types';

/**
 * Headless 3D board view adapter.
 * Method contracts mirror goboard-sdk Goboard / StoneLayer (BoardView),
 * without Raphael. R3F reads `pieces` ("col,row" → color).
 */
export default class Goboard_3d {
  clientColor = 1;
  currentColor = 1;
  whoFirst = 1;

  /** key: "col,row" → stone color (1 black / 2 white) */
  pieces: Record<string, number> = {};

  initialized = false;

  branch = false;
  branchStep = 0;
  branchOrders: Record<string, unknown> = {};
  addedStoneNum = 0;

  orders: Record<string, unknown> = {};
  coordinates: Record<string, unknown> = {};
  places: Record<string, unknown> = {};
  markers: Record<string, unknown> = {};
  branchMarkers: Record<string, unknown> = {};
  votes: Record<string, unknown> = {};

  /** history entries: "col,row,color" (optional 4th flag for added stones) */
  trace: string[] = [];

  clickStatus = '';
  currentMarker = '';
  myTurn = true;

  options = {
    clientColor: 1,
    whoFirst: 1,
    type: '',
    boardSize: 19,
    readonly: false,
    showOrder: false as boolean | 'last',
    showCoordinates: false,
    showHelperLines: false,
    playConfirm: false,
    sound: true,
  };

  head: unknown = null;

  onMarkCb = (_currentMarker: string, _col: number, _row: number) => {};
  onPlayCb = (_color: number, _col: number, _row: number) => {};
  onSetHeadCb = (_params: { col: number; row: number } | null) => {};
  onUpdateHelperLineCb = (_col: number, _row: number) => {};

  constructor(cfg: Partial<typeof Goboard_3d.prototype.options> = {}) {
    Object.assign(this.options, cfg);

    this.clientColor = this.options.clientColor || 1;
    this.whoFirst = this.options.whoFirst;

    this.init();
  }

  makeVertex(col: number, row: number) {
    return `${col},${row}`;
  }

  init() {
    this.pieces = {};
    this.setReadonly(this.options.readonly);
  }

  setReadonly(b: boolean) {
    this.options.readonly = b;
  }

  printBoard() {
    const boardSize = this.options.boardSize;
    const rows = [];

    for (let y = 0; y < boardSize; y++) {
      let row = '';
      for (let x = 0; x < boardSize; x++) {
        const stone = this.pieces[this.makeVertex(x, y)] || 0;

        if (stone === 0) row += '. ';
        else if (stone === 1) row += 'X ';
        else if (stone === 2) row += 'O ';
      }
      rows.push(row.trim());
    }

    console.log(rows.join('\n'));
  }

  oppositeColor(color: number) {
    return 3 - color;
  }

  isReadonly() {
    return this.options.readonly;
  }

  add(color: number, col: number, row: number, silent: boolean) {
    const key = this.makeVertex(col, row);

    this.trace.push(`${key},${color}`);

    if (col > this.options.boardSize || row > this.options.boardSize) {
      return false;
    }
    if (this.pieces[key]) {
      return false;
    }
    // not pass
    if (19 !== col && 19 !== row) {
      this.addPiece(key, col, row, color);

      if (!silent) {
        this.showHead();
      }
    }

    return true;
  }

  addPiece(
    key: string,
    _col: number,
    _row: number,
    color: number,
    _order?: number,
    _isRecover?: boolean
  ) {
    this.pieces[key] = color;
  }

  setClientColor(color: number) {
    this.clientColor = color;
  }

  setCurrentColor(color?: number) {
    if (color) {
      this.currentColor = color;
    } else if (this.trace.length) {
      const last = this.trace[this.trace.length - 1];
      const arr = last.split(',');
      // 最后一子是添加的（可选第 4 段）
      if (arr[3] === '1') {
        this.currentColor = this.whoFirst;
      } else {
        this.currentColor = arr[2] === '2' ? 1 : 2;
      }
    } else {
      this.currentColor = this.whoFirst;
    }
  }

  eat(vertexes: BoardPoint[]) {
    for (let i = 0; i < vertexes.length; i++) {
      const key = this.makeVertex(vertexes[i].col, vertexes[i].row);
      this.removePiece(key);
    }
  }

  removePiece(key: string) {
    delete this.pieces[key];
  }

  clearBoard() {
    this.pieces = {};
    this.trace = [];
    this.hideHead();
  }

  shoot(col: number, row: number) {
    if (this.clickStatus === 'marker') {
      this.onMarkCb.call(this, this.currentMarker, col, row);
    } else {
      this.onPlayCb.call(this, this.currentColor, col, row);
    }
  }

  onMark(cb: (marker: string, col: number, row: number) => void) {
    this.onMarkCb = cb;
    return this;
  }

  onPlay(cb: (color: number, col: number, row: number) => void) {
    this.onPlayCb = cb;
    return this;
  }

  onUpdateHelperLine(cb: (col: number, row: number) => void) {
    this.onUpdateHelperLineCb = cb;
    return this;
  }

  onSetHead(cb: (params: { col: number; row: number } | null) => void) {
    this.onSetHeadCb = cb;
    return this;
  }

  showHelperLine(_col: number, _row: number) {}

  hideHelperLine() {}

  showLastOrder() {}

  showOrder() {}

  updateDummyColor() {}

  clearMarkers() {}

  drawMarker(_mark: string, _col: number, _row: number) {}

  changeTheme(_settings: unknown) {}

  destroy() {
    this.clearBoard();
  }

  showHead() {
    const vertex = this.getLastMove();

    if (vertex !== undefined) {
      this.onSetHeadCb.call(this, vertex);
    } else {
      this.onSetHeadCb.call(this, null);
    }
  }

  hideHead() {
    this.onSetHeadCb.call(this, null);
  }

  getLastMove(): { col: number; row: number } | undefined {
    if (!this.trace || this.trace.length <= 0) {
      return;
    }
    const last = this.trace.length - 1;
    if (last < 0) {
      return;
    }

    const parts = this.trace[last].split(',');
    const col = parseInt(parts[0], 10);
    const row = parseInt(parts[1], 10);

    // pass
    if (col === 19 && row === 19) {
      return;
    }

    return { col, row };
  }

  recoverPiece(col: number, row: number, color: number) {
    let m: string | undefined;
    let key: string;
    let i: number;

    for (i = this.trace.length - 1; i >= 0; i--) {
      if (0 === this.trace[i].indexOf(col + ',' + row + ',')) {
        m = this.trace[i];
        break;
      }
    }

    if (!m) {
      key = this.makeVertex(col, row);
      this.removePiece(key);
      this.addPiece(key, col, row, color, -1);
    } else {
      const parts = m.split(',');
      color = parseInt(parts[2], 10);
      key = parts[0] + ',' + parts[1];

      this.removePiece(key);
      this.addPiece(key, col, row, color, i + 1 - this.addedStoneNum, true);
    }
  }
}
