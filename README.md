# FrankScale

FrankScale is a standalone public derivative of the original Vibe Kanban codebase, focused on self-hosting, local-first operation, and clearer orientation for humans and coding agents working in complex repositories.

## Purpose

This repository is currently used to:

- explore self-hosting of a multi-agent coding workspace
- experiment with adapting the codebase to new use cases
- provide a public, indexable repo for tools like Code Wiki to understand the system

## Status

FrankScale is in transition.

Parts of the codebase, naming, screenshots, and commands still reflect the upstream project. Over time this repo will:

- remove outdated upstream references
- document a clean self-hosting setup
- identify and replace dependencies on removed cloud services
- improve structure for both developers and AI agents

## What this is

The system provides:

- kanban-style planning for development work
- agent-based workspaces (branch + terminal + dev server)
- diff review with inline feedback
- multi-agent orchestration
- preview and PR workflows

## Quick start

```bash
npx vibe-kanban
