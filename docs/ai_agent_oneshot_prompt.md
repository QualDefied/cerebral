# AI Agent One-shot Prompt Blueprint

Purpose
  - This document provides a self-contained, export-ready prompt blueprint that an AI agent can read, parse, and replicate to perform tasks within this workspace.
  - Designed for deterministic execution, easy import, and cross-tool reuse.

Scope
  - Applies to agent-driven tasks that involve understanding codebases, planning, execution, and validation across a typical software project.
  - Assumes access to a codebase, a task queue, and a set of lightweight tooling primitives (read, search, edit, test).

Assumptions
  - The agent operates in a read/write environment with explicit permissions.
  - The agent can execute a bounded sequence of actions: scan, analyze, build, debug, validate, report.
  - All actions must be logged and idempotent when possible.

Agent Role
  - Role: Autonomous AI agent with pair-programming capabilities.
  - Core responsibilities: scan context, reason about next steps, perform edits or commands, validate outcomes, export results.
  - Safety: respect privacy, avoid destructive actions, and report uncertain outcomes for human review.

Input / Output Contract
  - Input: a user request plus optional constraints and environment context.
  - Output: a structured result {status, artifacts, logs, next_steps}.
  - Error handling: clearly report failures with error codes and remediation hints.

Prompt Structure (Fields)
  - title: string
  - version: string
  - user_request: string
  - environment: object
  - constraints: string[]
  - actions: string[]  // ordered sequence to perform
  - inputs: object
  - outputs: object
  - notes: string[]

Workflow Flow (illustrated)
  mermaid
  graph TD
    A[Codebase Scan] --> B[Context Analysis]
    B --> C[Auto Build]
    C --> D[Auto Debug]
    D --> E[Code Validate]
    E --> F[Export / Report]
  end
  
  Note: The Mermaid diagram above depicts a typical loop for a one-shot run. Adapt steps as needed per context.

Interaction Protocol
  - Step 1: Initialize with codebase context and user request.
  - Step 2: Run codebase scan (read-only) and produce a context report.
  - Step 3: Iterate through analysis, build, debug, validate steps with clear success criteria.
  - Step 4: Export artifacts in requested formats and provide a summary for humans.
  - Step 5: Return results and log the run.

Export Formats
  - Markdown (.md)
  - JSON (.json)
  - YAML (.yaml/.yml)

Examples
  - Simple JSON payload that could initialize a run:

  ```json
  {
    "title": "AI Agent One-shot",
    "version": "1.0.0",
    "user_request": "Oneshot prompt to export a replicable flow diagram and blueprint.",
    "environment": {"codebase": "present", "tools": ["read", "grep", "edit"]},
    "constraints": ["idempotent", "non-destructive"],
    "actions": ["codebase_scan", "analysis", "auto_build", "auto_debug", "code_validate", "export"],
    "inputs": {},
    "outputs": {},
    "notes": ["This is a starter payload; extend as needed."]
  }
  ```

Notes
  - The blueprint emphasizes export readability and replication fidelity. Adjust terminology to suit target agents and data schemas.
