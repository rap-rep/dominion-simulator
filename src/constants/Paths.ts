/**
 * Express router paths go here.
 */

export default {
  Base: "/api",
  Users: {
    Base: "/users",
    Get: "/all",
    Add: "/add",
    Update: "/update",
    Delete: "/delete/:id",
  },
  Game: {
    Game: "/game",
    Run: "/run",
    PostRun: "/post_run",
  },
} as const;
