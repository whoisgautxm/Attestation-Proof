import React from "react";
import "./loader.css";

export default function Loader() {
  return (
    <div class="loader-main">
      <div class="terminal-loader">
        <div class="terminal-header">
          <div class="terminal-controls">
            <div class="control close"></div>
            <div class="control minimize"></div>
            <div class="control maximize"></div>
          </div>
          <div class="terminal-title">Status</div>
        </div>

        <div class="content">
          <div class="text">Loading...</div>
        </div>
      </div>
    </div>
  );
}
