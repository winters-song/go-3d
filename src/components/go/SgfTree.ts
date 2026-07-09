const PropsName = {
  B: 'B',
  W: 'W',
  AB: 'AB',
  AW: 'AW',
  C: 'C',
  LB: 'LB',
  T: 'T',
};

enum Color {
  EMPTY,
  BLACK,
  WHITE,
}

export const AutoPlayStatus = {
  OK: 0,
  NO_MATCH: 1,
  OVER: 2,
};

class SgfProperty {
  name = '';
  values: any[] = [];

  constructor(name: string, values: any) {
    this.name = name;
    this.values = values || [];
  }

  toString() {
    let sb = this.name;
    for (let i = 0; i < this.values.length; i++) {
      sb += '[' + this.values[i] + ']';
    }
    return sb;
  }
}

export class SgfNode {
  parent?: SgfNode;
  children?: SgfNode[];
  properties?: SgfProperty[];
  id?: number;
  col?: number;
  row?: number;

  isFirstNode() {
    return !this.parent;
  }
  isLastNode() {
    return !this.children || this.children.length === 0;
  }
  // ignore: 忽略属性
  toSgf(ignore?: string[]) {
    if (!this.properties || this.properties.length <= 0) {
      return null;
    }
    let SgfTree = ';';
    for (let i = 0; i < this.properties.length; i++) {
      if (ignore && ignore.indexOf(this.properties[i].name) >= 0) {
        continue;
      }
      SgfTree += this.properties[i].toString();
    }
    return SgfTree;
  }
  getComment() {
    let c = this.getProperty(PropsName.C);
    if (c) {
      return c[0];
    }
    return '';
  }

  setComment(value: string) {
    if (!this.properties) {
      return;
    }
    let existed = false;
    for (let i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === PropsName.C) {
        this.properties[i].values = [value];
        existed = true;
        break;
      }
    }
    if (!existed) {
      this.properties.push(new SgfProperty(PropsName.C, [value]));
    }
  }

  getProperty(name: string) {
    if (!this.properties) return null;
    let p = null;
    for (let i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === name) {
        if (null === p) {
          p = this.properties[i].values;
        } else {
          p = p.concat(this.properties[i].values);
        }
      }
    }
    return p;
  }

  getChildNode(col: number, row: number) {
    if (this.isLastNode() || !this.children) {
      return false;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].col === col && this.children[i].row === row) {
        return this.children[i];
      }
    }
    return false;
  }

  static create(properties?: SgfProperty[]) {
    if (!properties || properties.length === 0) {
      return null;
    }

    let isMoveNode = false;
    let currentProperty;
    let name;
    let node;

    for (let i in properties) {
      name = properties[i].name.toUpperCase();

      if (PropsName.B === name || PropsName.W === name) {
        isMoveNode = true;
        currentProperty = properties[i];
        break;
      }
    }

    if (isMoveNode) {
      let v;
      if (!currentProperty) {
        v = Vertex.pass();
      } else {
        v = SgfTree.toVertex(currentProperty.values[0]);
      }
      if (v) {
        node = new SgfMoveNode(v.col, v.row, SgfTree.toInt(name), properties);
      }
    } else {
      node = new SgfNode();
    }
    if (node) {
      node.properties = properties;
    }

    return node;
  }
}

export class SgfMoveNode extends SgfNode {
  col?: number;
  row?: number;
  color?: number;
  isUserBranch?: boolean;
  constructor(col?: number, row?: number, color?: number, properties?: SgfProperty[]) {
    super();
    this.col = col;
    this.row = row;
    this.color = color;
    this.properties = properties;

    if (!properties) {
      this.generateProperties();
    }
  }
  // 棋盘落子时，需要手动生成properties
  generateProperties() {
    if (!this.properties) {
      this.properties = [];
    }

    const col = String.fromCharCode(97 + (this.col || 0));
    const row = String.fromCharCode(97 + (this.row || 0));

    this.properties.push(
      new SgfProperty(this.color === 1 ? PropsName.B : PropsName.W, [`${col}${row}`])
    );
  }
}

/**
 交叉点
 */
class Vertex {
  col?: number;
  row?: number;
  constructor(col?: number, row?: number) {
    this.col = col;
    this.row = row;
  }
  static pass() {
    return new Vertex();
  }
  equals(v: Vertex) {
    return this.col === v.col && this.row === v.row;
  }
}

const SgfStatus = {
  begin: 1,
  branchStart: 2,
  newProperty: 3,
  branchEnd: 4,
};

export class SgfTree {
  root?: SgfNode;
  current?: SgfNode;
  parseIndex = 0;

  constructor(sgf: string) {
    if (sgf) {
      this.loadSgf(sgf);
    }
  }

  autoPlay(col: number, row: number, color: number) {
    if (!this.hasChildNode(col, row)) {
      return { status: AutoPlayStatus.NO_MATCH };
    }
    let result = {
      status: AutoPlayStatus.OK,
      playNode: <any>null,
      selectable: <any>null,
      next: <any>null,
    };
    let playNode = this.forward(col, row);
    result.playNode = playNode;
    if (playNode?.isLastNode()) {
      result.status = AutoPlayStatus.OVER;
      return result;
    }
    if (playNode && playNode.children) {
      // 如果存在多个分支，随机选择一个
      result.selectable = playNode.children;
      this.current = playNode.children[Math.floor(Math.random() * playNode.children.length)];
      result.next = this.current;
      if (this.current.isLastNode()) {
        result.status = AutoPlayStatus.OVER;
      }
    }
    return result;
  }

  hasChildNode(col: number, row: number, _node?: SgfMoveNode) {
    let node = _node || this.current;
    if (!node || node.isLastNode() || !node.children) {
      return false;
    }
    for (let i = 0; i < node.children.length; i++) {
      if (node.children[i].col === col && node.children[i].row === row) {
        return true;
      }
    }
    return false;
  }

  /**
	 if col or row is undefined and then select main trunk
	 */
  forward(col?: number, row?: number) {
    if (!this.current || this.current.isLastNode()) {
      return;
    }

    if (this.current.children && (undefined === col || undefined === row)) {
      this.current = this.current.children[0];
    }
    if (this.current.children) {
      for (let i = 0; i < this.current.children?.length; i++) {
        if (this.current.children[i].col === col && this.current.children[i].row === row) {
          this.current = this.current.children[i];
          break;
        }
      }
    }
    return this.current;
  }

  back() {
    if (this.current?.isFirstNode()) {
      return null;
    }
    this.current = this.current?.parent;
    return this.current;
  }

  walkTrunk(cb: (node?: SgfNode) => void, node?: SgfNode) {
    node = node || this.root;
    if (!node) return cb();
    while (node) {
      cb(node);
      node = node.children && node.children[0];
    }
  }

  walk(cb: (node?: SgfNode, index?: number) => void, node?: SgfNode, index?: number) {
    node = node || this.root;
    index = index || 0;
    cb(node, index);
    if (node?.isLastNode()) {
      return;
    }
    if (node?.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.walk(cb, node.children[i], i);
      }
    }
  }

  getStep() {
    let step = 0;
    this.walkTrunk(function (node) {
      //落子 或 答案
      if (node instanceof SgfMoveNode) {
        step++;
      }
    });
    return step;
  }

  loadSgf(sgf: string) {
    this.parseIndex = 0;
    this.root = this.parse(sgf, SgfStatus.begin);
    this.current = this.root;
  }

  parse(sgf: string, s: number) {
    s = s || SgfStatus.begin;
    let root;
    let current;
    let next = null;
    let buffer = '';
    let c;
    while (this.parseIndex < sgf.length) {
      c = sgf.charAt(this.parseIndex);
      this.parseIndex++;
      switch (s) {
        case SgfStatus.begin:
          if ('(' === c) {
            s = SgfStatus.branchStart;
          }
          break;
        case SgfStatus.branchStart:
          if (';' === c) {
            s = SgfStatus.newProperty;
          }
          if (current) {
            if (!current.children) {
              current.children = [];
            }
            let r = this.parse(sgf, s);

            if (!r) {
              break;
            }
            current?.children.push(r);
            r.parent = current;
          }
          break;
        case SgfStatus.newProperty:
          if (';' === c || '(' === c || ')' === c) {
            let ps = SgfTree.parseProperty(buffer.replace(/^\s+|\s+$/g, ''));
            buffer = '';
            next = SgfNode.create(ps);
            if (next) {
              if (!root) {
                root = next;
              }
              if (current) {
                next.parent = current;
                if (!current.children) {
                  current.children = [];
                }
                current?.children?.push(next);
              }
              current = next;
            }
            if (';' === c) {
              s = SgfStatus.newProperty;
              break;
            }
            if ('(' === c) {
              s = SgfStatus.branchStart;
              break;
            }
            if (')' === c) {
              return root;
            }
            break;
          }
          buffer += c;
          break;
        case SgfStatus.branchEnd:
          console.log('w status:' + s);
          return root;
        default:
          break;
      }
    }
    return root;
  }

  getNodeString(node: SgfNode) {
    let arr: string[] = [];
    node.properties?.forEach(p => {
      let str = `${p.name}[${p.values.join('][')}]`;
      arr.push(str);
    });
    return arr.join('');
  }

  getBranchString(node: SgfNode): string {
    if (node.children && node.children.length) {
      if (node.children.length === 1) {
        const child = node.children[0];
        const nodeString = this.getNodeString(child);
        const branchString = this.getBranchString(child);

        return `;${nodeString}${branchString}`;
      } else {
        let arr = node.children.map(item => this.getSgfString(item));

        return arr.join('');
      }
    } else {
      return '';
    }
  }

  getSgfString(node: SgfNode) {
    const nodeString = this.getNodeString(node);
    const branchString = this.getBranchString(node);

    return `(;${nodeString}${branchString})`;
  }

  toString() {
    return this.root ? this.getSgfString(this.root) : '';
  }

  static parseProperty(str: string) {
    let result: SgfProperty[] = [];
    // @ts-ignore
    str.replace(/(\w+)((\[[^\]]*\]\s*)+)/gim, function ($0, $1, $2) {
      let ps: string[] = [];
      // @ts-ignore
      $2.replace(/\s*\[([^\]]*)\]\s*/gm, function ($$0, $$1) {
        ps.push($$1);
      });
      result.push(new SgfProperty($1, ps));
    });
    return result;
  }

  static toInt(color?: string) {
    if ('B' === color) {
      return Color.BLACK;
    }
    if ('W' === color) {
      return Color.WHITE;
    }
    return Color.EMPTY;
  }

  static fromInt(c: number) {
    if (Color.BLACK === c) {
      return 'B';
    }
    if (Color.WHITE === c) {
      return 'W';
    }
    return;
  }

  // 取sgf根节点（题干），并添加当前棋盘分支
  static addTrace(sgf: string, trace: string[]) {
    const t = new SgfTree(sgf);
    let traceSgf = '(' + t.root?.toSgf();
    for (let i = 0; i < trace.length; i++) {
      const step = trace[i].split(',').map(i => parseInt(i));
      const col = step[0];
      const row = step[1];
      const color = step[2];

      if (color !== Color.BLACK && color !== Color.WHITE) {
        continue;
      }
      traceSgf += ';' + SgfTree.fromInt(color) + '[' + SgfTree.toGnuCo(col, row) + ']';
    }
    return traceSgf + ')';
  }

  /**
   * ab -> 0,1
   * @param strVertex
   * @return
   */
  static toVertex(strVertex: string) {
    if (null === strVertex || strVertex.length === 0) {
      return Vertex.pass();
    }
    let str = strVertex.toLowerCase();
    if (2 !== str.length) {
      return null;
    }
    return new Vertex(str.charCodeAt(0) - 'a'.charCodeAt(0), str.charCodeAt(1) - 'a'.charCodeAt(0));
  }

  static toGnuCo(col?: number, row?: number) {
    if (undefined === col || undefined === row) {
      return '';
    }
    return (
      String.fromCharCode('a'.charCodeAt(0) + col) + String.fromCharCode('a'.charCodeAt(0) + row)
    );
  }
}
