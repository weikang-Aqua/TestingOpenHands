#!/usr/bin/env python3
"""
Demo script to showcase the Go game functionality.
"""

from go_game import GoGame


def demo_basic_game():
    """Demonstrate a basic game scenario."""
    print("=" * 60)
    print("围棋游戏演示 (Go Game Demo)")
    print("=" * 60)
    print()
    
    # Create a 9x9 board for faster demo
    print("创建一个 9x9 的棋盘... (Creating a 9x9 board...)")
    game = GoGame(size=9)
    
    print("\n初始棋盘 (Initial board):")
    game.display_board()
    
    print("\n\n演示几步棋... (Demonstrating some moves...)")
    
    moves = [
        (2, 2, "黑棋下在 (2, 2) - Black plays at (2, 2)"),
        (2, 6, "白棋下在 (2, 6) - White plays at (2, 6)"),
        (6, 2, "黑棋下在 (6, 2) - Black plays at (6, 2)"),
        (6, 6, "白棋下在 (6, 6) - White plays at (6, 6)"),
        (4, 4, "黑棋下在中心 (4, 4) - Black plays at center (4, 4)"),
    ]
    
    for row, col, description in moves:
        print(f"\n{description}")
        if game.make_move(row, col):
            game.display_board()
        else:
            print("移动失败！(Move failed!)")
    
    print("\n\n演示提子（吃子）... (Demonstrating capture...)")
    game2 = GoGame(size=9)
    
    # Set up a capture situation
    capture_moves = [
        (4, 4, "黑棋 (Black)"),
        (4, 5, "白棋 (White) - 将被包围"),
        (3, 5, "黑棋 (Black)"),
        (0, 0, "白棋 (White) - 下在别处"),
        (5, 5, "黑棋 (Black)"),
        (0, 1, "白棋 (White) - 下在别处"),
        (4, 6, "黑棋 (Black) - 吃掉白棋！(Captures white!)"),
    ]
    
    for row, col, description in capture_moves:
        print(f"\n{description}")
        game2.make_move(row, col)
    
    print("\n最终棋盘（白棋被吃）- Final board (white captured):")
    game2.display_board()
    
    print("\n\n演示打劫规则... (Demonstrating Ko rule...)")
    game3 = GoGame(size=9)
    
    # Set up a ko situation (simplified)
    ko_moves = [
        (3, 4),  # Black
        (3, 5),  # White
        (4, 3),  # Black
        (4, 5),  # White
        (5, 4),  # Black
        (5, 5),  # White
        (4, 4),  # Black - captures white at (4, 5)
    ]
    
    for row, col in ko_moves:
        game3.make_move(row, col)
    
    print("\n黑棋刚吃掉白棋... (Black just captured white...)")
    game3.display_board()
    
    print("\n白棋尝试立即反提 (White tries to recapture immediately)...")
    if game3.make_move(4, 5):
        print("反提成功 (Recapture succeeded)")
    else:
        print("✓ 反提失败 - 打劫规则生效！(Recapture failed - Ko rule in effect!)")
    
    print("\n\n演示游戏结束（双方 pass）... (Demonstrating game end with passes...)")
    game4 = GoGame(size=9)
    game4.make_move(4, 4)  # Black
    game4.make_move(4, 5)  # White
    
    print("\n双方连续跳过 (Both players pass consecutively)...")
    game4.pass_move()  # Black passes
    print("黑棋 pass (Black passes)")
    game4.pass_move()  # White passes
    print("白棋 pass (White passes)")
    
    game4.display_board()
    
    print("\n" + "=" * 60)
    print("演示完成！(Demo complete!)")
    print("=" * 60)


if __name__ == "__main__":
    demo_basic_game()
