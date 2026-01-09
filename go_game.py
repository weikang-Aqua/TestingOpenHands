#!/usr/bin/env python3
"""
围棋 (Go/Weiqi) Game Implementation

This is a simple implementation of the traditional Chinese board game Go (围棋).
The game supports basic rules including:
- Stone placement
- Capture (removing stones with no liberties)
- Ko rule (preventing immediate recapture)
- Pass moves
"""


class GoGame:
    """
    Represents a Go game with a board and game state.
    """
    
    # Board cell states
    EMPTY = 0
    BLACK = 1
    WHITE = 2
    
    def __init__(self, size=19):
        """
        Initialize a Go game board.
        
        Args:
            size: Size of the board (default: 19x19, standard Go board)
        """
        self.size = size
        self.board = [[self.EMPTY for _ in range(size)] for _ in range(size)]
        self.current_player = self.BLACK
        self.pass_count = 0
        self.game_over = False
        self.captured = {self.BLACK: 0, self.WHITE: 0}
        self.ko_point = None  # Store the ko point to prevent immediate recapture
        self.move_history = []
        
    def get_player_name(self, player):
        """Get the name of the player."""
        if player == self.BLACK:
            return "黑棋 (Black)"
        elif player == self.WHITE:
            return "白棋 (White)"
        return "Empty"
    
    def is_valid_position(self, row, col):
        """Check if a position is valid on the board."""
        return 0 <= row < self.size and 0 <= col < self.size
    
    def get_neighbors(self, row, col):
        """Get all valid neighboring positions."""
        neighbors = []
        for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            new_row, new_col = row + dr, col + dc
            if self.is_valid_position(new_row, new_col):
                neighbors.append((new_row, new_col))
        return neighbors
    
    def get_group(self, row, col):
        """
        Get all stones in the same group (connected stones of the same color).
        Returns a set of (row, col) tuples.
        """
        if self.board[row][col] == self.EMPTY:
            return set()
        
        color = self.board[row][col]
        group = set()
        stack = [(row, col)]
        
        while stack:
            r, c = stack.pop()
            if (r, c) in group:
                continue
            group.add((r, c))
            
            for nr, nc in self.get_neighbors(r, c):
                if self.board[nr][nc] == color and (nr, nc) not in group:
                    stack.append((nr, nc))
        
        return group
    
    def count_liberties(self, group):
        """
        Count the number of liberties (empty adjacent spaces) for a group.
        
        Args:
            group: Set of (row, col) tuples representing a group of stones
            
        Returns:
            Number of liberties
        """
        liberties = set()
        for row, col in group:
            for nr, nc in self.get_neighbors(row, col):
                if self.board[nr][nc] == self.EMPTY:
                    liberties.add((nr, nc))
        return len(liberties)
    
    def remove_captured_groups(self, opponent_color):
        """
        Remove all groups of the opponent color that have no liberties.
        Returns the number of stones captured.
        """
        captured_count = 0
        checked = set()
        
        for row in range(self.size):
            for col in range(self.size):
                if self.board[row][col] == opponent_color and (row, col) not in checked:
                    group = self.get_group(row, col)
                    checked.update(group)
                    
                    if self.count_liberties(group) == 0:
                        # Remove the group
                        for r, c in group:
                            self.board[r][c] = self.EMPTY
                        captured_count += len(group)
        
        return captured_count
    
    def would_be_suicide(self, row, col, color):
        """
        Check if placing a stone would be suicide (placing with no liberties
        and not capturing any opponent stones).
        """
        # Temporarily place the stone
        self.board[row][col] = color
        
        # Check if this stone's group has liberties
        group = self.get_group(row, col)
        has_liberties = self.count_liberties(group) > 0
        
        # Remove the temporary stone
        self.board[row][col] = self.EMPTY
        
        if has_liberties:
            return False
        
        # Check if placing would capture opponent stones
        opponent_color = self.WHITE if color == self.BLACK else self.BLACK
        for nr, nc in self.get_neighbors(row, col):
            if self.board[nr][nc] == opponent_color:
                opponent_group = self.get_group(nr, nc)
                # If placing here would reduce opponent liberties to 0, it's a capture, not suicide
                if self.count_liberties(opponent_group) == 1:
                    return False
        
        return True
    
    def make_move(self, row, col):
        """
        Make a move at the specified position.
        
        Returns:
            True if the move was successful, False otherwise
        """
        if self.game_over:
            return False
        
        # Check if position is valid
        if not self.is_valid_position(row, col):
            return False
        
        # Check if position is empty
        if self.board[row][col] != self.EMPTY:
            return False
        
        # Check ko rule
        if self.ko_point == (row, col):
            return False
        
        # Check suicide rule
        if self.would_be_suicide(row, col, self.current_player):
            return False
        
        # Place the stone
        self.board[row][col] = self.current_player
        self.pass_count = 0
        
        # Capture opponent stones
        opponent_color = self.WHITE if self.current_player == self.BLACK else self.BLACK
        captured = self.remove_captured_groups(opponent_color)
        
        if captured > 0:
            self.captured[self.current_player] += captured
        
        # Update ko point
        # Ko situation: if exactly one stone was captured and the placed stone
        # is in atari (has exactly one liberty), mark the capture point
        if captured == 1:
            my_group = self.get_group(row, col)
            if self.count_liberties(my_group) == 1:
                # Find the captured stone's position (now empty)
                for nr, nc in self.get_neighbors(row, col):
                    if self.board[nr][nc] == self.EMPTY:
                        self.ko_point = (nr, nc)
                        break
            else:
                self.ko_point = None
        else:
            self.ko_point = None
        
        # Record move
        self.move_history.append((row, col, self.current_player))
        
        # Switch player
        self.current_player = self.WHITE if self.current_player == self.BLACK else self.BLACK
        
        return True
    
    def pass_move(self):
        """
        Pass the current turn.
        If both players pass consecutively, the game ends.
        """
        if self.game_over:
            return False
        
        self.pass_count += 1
        self.move_history.append(('pass', None, self.current_player))
        
        if self.pass_count >= 2:
            self.game_over = True
        
        self.current_player = self.WHITE if self.current_player == self.BLACK else self.BLACK
        self.ko_point = None
        
        return True
    
    def display_board(self):
        """Display the current board state."""
        # Column headers
        print("\n   ", end="")
        for i in range(self.size):
            print(f"{i:2}", end=" ")
        print()
        
        # Board
        for row in range(self.size):
            print(f"{row:2} ", end="")
            for col in range(self.size):
                cell = self.board[row][col]
                if cell == self.EMPTY:
                    # Show board intersections
                    if row == 0 and col == 0:
                        print("┌─", end=" ")
                    elif row == 0 and col == self.size - 1:
                        print("┐ ", end=" ")
                    elif row == self.size - 1 and col == 0:
                        print("└─", end=" ")
                    elif row == self.size - 1 and col == self.size - 1:
                        print("┘ ", end=" ")
                    elif row == 0:
                        print("┬─", end=" ")
                    elif row == self.size - 1:
                        print("┴─", end=" ")
                    elif col == 0:
                        print("├─", end=" ")
                    elif col == self.size - 1:
                        print("┤ ", end=" ")
                    else:
                        print("┼─", end=" ")
                elif cell == self.BLACK:
                    print("●", end="  ")
                elif cell == self.WHITE:
                    print("○", end="  ")
            print()
        
        print(f"\n当前玩家 (Current): {self.get_player_name(self.current_player)}")
        print(f"黑棋俘获 (Black captured): {self.captured[self.BLACK]}")
        print(f"白棋俘获 (White captured): {self.captured[self.WHITE]}")
        
        if self.game_over:
            print("\n游戏结束！(Game Over!)")


def main():
    """Main function to run the Go game."""
    print("=" * 60)
    print("欢迎来到围棋游戏！")
    print("Welcome to Go (Weiqi) Game!")
    print("=" * 60)
    print()
    
    # Ask for board size
    print("选择棋盘大小 (Choose board size):")
    print("1. 9x9 (小棋盘 / Small)")
    print("2. 13x13 (中等棋盘 / Medium)")
    print("3. 19x19 (标准棋盘 / Standard)")
    
    while True:
        choice = input("\n输入选择 (Enter choice) [1-3, default=3]: ").strip()
        if choice == "1":
            size = 9
            break
        elif choice == "2":
            size = 13
            break
        elif choice == "" or choice == "3":
            size = 19
            break
        else:
            print("无效选择，请重新输入。(Invalid choice, please try again.)")
    
    game = GoGame(size=size)
    
    print(f"\n开始游戏！棋盘大小: {size}x{size}")
    print(f"Starting game! Board size: {size}x{size}")
    print("\n游戏规则 (Game Rules):")
    print("- 输入 'row col' 下棋，例如: 3 3")
    print("  Enter 'row col' to place a stone, e.g., 3 3")
    print("- 输入 'pass' 跳过回合")
    print("  Enter 'pass' to pass your turn")
    print("- 输入 'quit' 退出游戏")
    print("  Enter 'quit' to exit the game")
    print("- 连续两次 pass 游戏结束")
    print("  Two consecutive passes end the game")
    
    while not game.game_over:
        game.display_board()
        
        command = input(f"\n{game.get_player_name(game.current_player)} 请下棋 (Your move): ").strip().lower()
        
        if command == "quit":
            print("\n游戏已退出。(Game quit.)")
            break
        elif command == "pass":
            if game.pass_move():
                print("跳过回合。(Pass.)")
            else:
                print("无法跳过。(Cannot pass.)")
        else:
            try:
                parts = command.split()
                if len(parts) != 2:
                    print("无效输入。请输入 'row col' 格式。")
                    print("Invalid input. Please enter in 'row col' format.")
                    continue
                
                row, col = int(parts[0]), int(parts[1])
                
                if game.make_move(row, col):
                    print(f"下棋成功：({row}, {col})")
                    print(f"Move successful: ({row}, {col})")
                else:
                    print("无效的移动！可能的原因：")
                    print("- 位置已被占据")
                    print("- 违反打劫规则")
                    print("- 自杀手（没有气且不能吃子）")
                    print()
                    print("Invalid move! Possible reasons:")
                    print("- Position is occupied")
                    print("- Ko rule violation")
                    print("- Suicide move (no liberties and doesn't capture)")
            except (ValueError, IndexError):
                print("输入错误。请输入两个数字，例如: 3 3")
                print("Input error. Please enter two numbers, e.g., 3 3")
    
    game.display_board()
    
    print("\n" + "=" * 60)
    print("感谢游玩围棋！")
    print("Thank you for playing Go!")
    print("=" * 60)


if __name__ == "__main__":
    main()
