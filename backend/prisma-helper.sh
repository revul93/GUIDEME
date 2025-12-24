#!/bin/bash

# Prisma Helper Script
# Quick commands for common Prisma operations

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  GuideMe - Prisma Helper Script${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

show_menu() {
    echo -e "${GREEN}Available Commands:${NC}"
    echo ""
    echo "  1) generate      - Generate Prisma Client"
    echo "  2) migrate       - Create and apply migration"
    echo "  3) migrate-prod  - Apply migrations (production)"
    echo "  4) studio        - Open Prisma Studio"
    echo "  5) seed          - Seed database with initial data"
    echo "  6) reset         - Reset database (WARNING: deletes all data)"
    echo "  7) push          - Push schema changes without migration"
    echo "  8) pull          - Pull schema from database"
    echo "  9) format        - Format Prisma schema"
    echo "  10) validate     - Validate Prisma schema"
    echo ""
    echo "  0) Exit"
    echo ""
}

generate_client() {
    echo -e "${YELLOW}Generating Prisma Client...${NC}"
    npx prisma generate
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
}

create_migration() {
    echo -e "${YELLOW}Creating migration...${NC}"
    read -p "Enter migration name: " migration_name
    npx prisma migrate dev --name "$migration_name"
    echo -e "${GREEN}✓ Migration created and applied${NC}"
}

migrate_prod() {
    echo -e "${YELLOW}Applying migrations to production...${NC}"
    npx prisma migrate deploy
    echo -e "${GREEN}✓ Migrations applied${NC}"
}

open_studio() {
    echo -e "${YELLOW}Opening Prisma Studio...${NC}"
    npx prisma studio
}

seed_database() {
    echo -e "${YELLOW}Seeding database...${NC}"
    node prisma/seed.js
    echo -e "${GREEN}✓ Database seeded${NC}"
}

reset_database() {
    echo -e "${RED}WARNING: This will delete all data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Resetting database...${NC}"
        npx prisma migrate reset --force
        echo -e "${GREEN}✓ Database reset${NC}"
    else
        echo -e "${YELLOW}Reset cancelled${NC}"
    fi
}

push_schema() {
    echo -e "${YELLOW}Pushing schema changes...${NC}"
    npx prisma db push
    echo -e "${GREEN}✓ Schema pushed${NC}"
}

pull_schema() {
    echo -e "${YELLOW}Pulling schema from database...${NC}"
    npx prisma db pull
    echo -e "${GREEN}✓ Schema pulled${NC}"
}

format_schema() {
    echo -e "${YELLOW}Formatting Prisma schema...${NC}"
    npx prisma format
    echo -e "${GREEN}✓ Schema formatted${NC}"
}

validate_schema() {
    echo -e "${YELLOW}Validating Prisma schema...${NC}"
    npx prisma validate
    echo -e "${GREEN}✓ Schema is valid${NC}"
}

# Main script
print_header

if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Select an option: " choice
        echo ""
        
        case $choice in
            1) generate_client ;;
            2) create_migration ;;
            3) migrate_prod ;;
            4) open_studio ;;
            5) seed_database ;;
            6) reset_database ;;
            7) push_schema ;;
            8) pull_schema ;;
            9) format_schema ;;
            10) validate_schema ;;
            0) echo -e "${GREEN}Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
        clear
        print_header
    done
else
    # Command line mode
    case $1 in
        generate) generate_client ;;
        migrate) create_migration ;;
        migrate-prod) migrate_prod ;;
        studio) open_studio ;;
        seed) seed_database ;;
        reset) reset_database ;;
        push) push_schema ;;
        pull) pull_schema ;;
        format) format_schema ;;
        validate) validate_schema ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo ""
            echo "Usage: ./prisma-helper.sh [command]"
            echo ""
            echo "Commands:"
            echo "  generate, migrate, migrate-prod, studio, seed,"
            echo "  reset, push, pull, format, validate"
            exit 1
            ;;
    esac
fi
