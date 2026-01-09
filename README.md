# TestingOpenHands

## 围棋游戏 (Go/Weiqi Game)

这个仓库包含了围棋（Go/Weiqi）游戏的 Python 实现。围棋是一种古老的中国棋类游戏，有着几千年的历史。

This repository contains a Python implementation of Go (Weiqi), an ancient Chinese board game with thousands of years of history.

### 功能特性 (Features)

- ✅ 支持标准的 19x19 棋盘，以及 9x9 和 13x13 小棋盘
- ✅ 完整的围棋规则实现
  - 提子规则（吃掉无气的棋子）
  - 打劫规则（防止立即反提）
  - 禁止自杀（不能下没有气的棋）
- ✅ 命令行界面
- ✅ 双语支持（中文/英文）
- ✅ 显示被俘获的棋子数量

**Features:**
- ✅ Support for standard 19x19 board, as well as 9x9 and 13x13 boards
- ✅ Complete Go rules implementation
  - Capture rule (removing stones with no liberties)
  - Ko rule (preventing immediate recapture)
  - No suicide rule (cannot place stones with no liberties)
- ✅ Command-line interface
- ✅ Bilingual support (Chinese/English)
- ✅ Display captured stone counts

### 如何运行 (How to Run)

#### 前提条件 (Prerequisites)

- Python 3.6 或更高版本 (Python 3.6 or higher)

#### 启动游戏 (Start the Game)

```bash
python3 go_game.py
```

或者 (or):

```bash
chmod +x go_game.py
./go_game.py
```

### 游戏说明 (Game Instructions)

#### 棋盘大小 (Board Size)

游戏开始时，你可以选择三种棋盘大小：

At the start, you can choose from three board sizes:

- **9x9**: 小棋盘，适合快速游戏 (Small board, suitable for quick games)
- **13x13**: 中等棋盘 (Medium board)
- **19x19**: 标准棋盘，国际比赛标准 (Standard board, international competition standard)

#### 如何下棋 (How to Play)

1. **下棋**: 输入行号和列号，用空格分隔，例如 `3 3`
   - **Place a stone**: Enter row and column numbers separated by space, e.g., `3 3`

2. **跳过**: 输入 `pass` 跳过当前回合
   - **Pass**: Enter `pass` to skip your turn

3. **退出**: 输入 `quit` 退出游戏
   - **Quit**: Enter `quit` to exit the game

4. **游戏结束**: 当双方连续跳过时，游戏结束
   - **Game end**: Game ends when both players pass consecutively

#### 棋盘符号 (Board Symbols)

- `●` - 黑棋 (Black stone)
- `○` - 白棋 (White stone)
- `┼` - 空位 (Empty intersection)

#### 围棋基本规则 (Basic Go Rules)

1. **交替下棋**: 黑棋先行，然后黑白交替下棋
   - **Alternating turns**: Black plays first, then players alternate

2. **提子**: 当一组棋子的所有气（相邻空位）都被对方占据时，这组棋子被提走
   - **Capture**: When a group of stones has all its liberties (adjacent empty points) occupied by opponent, the group is captured

3. **打劫**: 不能立即反提刚才被提走的单个棋子
   - **Ko rule**: Cannot immediately recapture a single stone that was just captured

4. **禁止自杀**: 不能下导致自己棋子立即没有气的棋（除非这步棋能吃掉对方棋子）
   - **No suicide**: Cannot place a stone that would have no liberties (unless it captures opponent stones)

### 游戏示例 (Game Example)

```
   0  1  2  3  4  5  6  7  8 
 0 ┌─ ┬─ ┬─ ┬─ ┬─ ┬─ ┬─ ┬─ ┐ 
 1 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 2 ├─ ┼─ ●  ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 3 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ○  ┼─ ┤ 
 4 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 5 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 6 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 7 ├─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┼─ ┤ 
 8 └─ ┴─ ┴─ ┴─ ┴─ ┴─ ┴─ ┴─ ┘ 

当前玩家 (Current): 黑棋 (Black)
黑棋俘获 (Black captured): 0
白棋俘获 (White captured): 0
```

### 开发和测试 (Development and Testing)

要测试游戏的核心功能，你可以在 Python 解释器中导入 `GoGame` 类：

To test the core game functionality, you can import the `GoGame` class in a Python interpreter:

```python
from go_game import GoGame

# 创建一个 9x9 的棋盘 (Create a 9x9 board)
game = GoGame(size=9)

# 下棋 (Place stones)
game.make_move(2, 2)  # 黑棋 (Black)
game.make_move(2, 3)  # 白棋 (White)
game.make_move(3, 2)  # 黑棋 (Black)

# 显示棋盘 (Display board)
game.display_board()
```

### 许可证 (License)

本项目采用 MIT 许可证。

This project is licensed under the MIT License.