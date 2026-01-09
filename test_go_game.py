#!/usr/bin/env python3
"""
Test suite for the Go game implementation.
"""

import sys
from go_game import GoGame


def test_board_initialization():
    """Test that the board initializes correctly."""
    print("Testing board initialization...")
    game = GoGame(size=9)
    
    assert game.size == 9, "Board size should be 9"
    assert game.current_player == GoGame.BLACK, "Black should start first"
    assert not game.game_over, "Game should not be over at start"
    assert game.captured[GoGame.BLACK] == 0, "No captures at start"
    assert game.captured[GoGame.WHITE] == 0, "No captures at start"
    
    # Check all cells are empty
    for row in range(game.size):
        for col in range(game.size):
            assert game.board[row][col] == GoGame.EMPTY, f"Cell ({row}, {col}) should be empty"
    
    print("✓ Board initialization test passed")


def test_basic_move():
    """Test basic stone placement."""
    print("\nTesting basic move...")
    game = GoGame(size=9)
    
    # Black makes a move
    assert game.make_move(4, 4), "Should be able to place black stone at (4, 4)"
    assert game.board[4][4] == GoGame.BLACK, "Stone at (4, 4) should be black"
    assert game.current_player == GoGame.WHITE, "Should be white's turn after black moves"
    
    # White makes a move
    assert game.make_move(4, 5), "Should be able to place white stone at (4, 5)"
    assert game.board[4][5] == GoGame.WHITE, "Stone at (4, 5) should be white"
    assert game.current_player == GoGame.BLACK, "Should be black's turn after white moves"
    
    # Try to place on occupied position
    assert not game.make_move(4, 4), "Should not be able to place stone on occupied position"
    
    print("✓ Basic move test passed")


def test_capture():
    """Test stone capture logic."""
    print("\nTesting capture logic...")
    game = GoGame(size=9)
    
    # Set up a situation where a white stone can be captured
    # Black stones surrounding a white stone
    game.make_move(4, 4)  # Black
    game.make_move(4, 5)  # White (will be captured)
    game.make_move(3, 5)  # Black
    game.make_move(0, 0)  # White (elsewhere)
    game.make_move(5, 5)  # Black
    game.make_move(0, 1)  # White (elsewhere)
    game.make_move(4, 6)  # Black - this should capture white at (4, 5)
    
    assert game.board[4][5] == GoGame.EMPTY, "White stone at (4, 5) should be captured"
    assert game.captured[GoGame.BLACK] == 1, "Black should have captured 1 stone"
    
    print("✓ Capture test passed")


def test_suicide_prevention():
    """Test that suicide moves are prevented."""
    print("\nTesting suicide prevention...")
    game = GoGame(size=9)
    
    # Set up: surround position (4, 5) with black stones
    game.make_move(3, 5)  # Black
    game.make_move(0, 0)  # White elsewhere
    game.make_move(5, 5)  # Black
    game.make_move(0, 1)  # White elsewhere
    game.make_move(4, 4)  # Black
    game.make_move(0, 2)  # White elsewhere
    game.make_move(4, 6)  # Black
    
    # Now position (4, 5) is surrounded by black stones on all four sides
    # White trying to place at (4, 5) would be suicide (no liberties)
    assert not game.make_move(4, 5), "Should prevent suicide move"
    
    print("✓ Suicide prevention test passed")


def test_pass_and_game_end():
    """Test passing and game ending."""
    print("\nTesting pass and game end...")
    game = GoGame(size=9)
    
    assert not game.game_over, "Game should not be over initially"
    
    # First pass
    game.pass_move()
    assert game.pass_count == 1, "Pass count should be 1"
    assert not game.game_over, "Game should not be over after one pass"
    
    # Second pass
    game.pass_move()
    assert game.pass_count == 2, "Pass count should be 2"
    assert game.game_over, "Game should be over after two consecutive passes"
    
    print("✓ Pass and game end test passed")


def test_group_detection():
    """Test that groups of stones are detected correctly."""
    print("\nTesting group detection...")
    game = GoGame(size=9)
    
    # Create a group of connected black stones
    game.make_move(4, 4)  # Black
    game.make_move(0, 0)  # White elsewhere
    game.make_move(4, 5)  # Black (connected to first)
    game.make_move(0, 1)  # White elsewhere
    game.make_move(5, 5)  # Black (connected to second)
    
    # Get the group starting from (4, 4)
    group = game.get_group(4, 4)
    
    assert len(group) == 3, f"Group should have 3 stones, but has {len(group)}"
    assert (4, 4) in group, "(4, 4) should be in group"
    assert (4, 5) in group, "(4, 5) should be in group"
    assert (5, 5) in group, "(5, 5) should be in group"
    
    print("✓ Group detection test passed")


def test_liberty_counting():
    """Test liberty counting for groups."""
    print("\nTesting liberty counting...")
    game = GoGame(size=9)
    
    # Single stone in the middle has 4 liberties
    game.make_move(4, 4)  # Black
    group = game.get_group(4, 4)
    liberties = game.count_liberties(group)
    assert liberties == 4, f"Single stone in middle should have 4 liberties, has {liberties}"
    
    # Stone in corner has 2 liberties
    game2 = GoGame(size=9)
    game2.make_move(0, 0)  # Black in corner
    group2 = game2.get_group(0, 0)
    liberties2 = game2.count_liberties(group2)
    assert liberties2 == 2, f"Stone in corner should have 2 liberties, has {liberties2}"
    
    print("✓ Liberty counting test passed")


def run_all_tests():
    """Run all tests."""
    print("=" * 60)
    print("Running Go Game Tests")
    print("=" * 60)
    
    try:
        test_board_initialization()
        test_basic_move()
        test_capture()
        test_suicide_prevention()
        test_pass_and_game_end()
        test_group_detection()
        test_liberty_counting()
        
        print("\n" + "=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        return 0
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        print("=" * 60)
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
