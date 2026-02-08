#!/bin/bash

# Color System Migration Script
# Mengganti semua hardcoded color classes dengan centralized color system

# Define replacement mappings
declare -A COLOR_MAPPINGS=(
    ["text-blue-600"]="text-info"
    ["text-blue-700"]="text-primary-700"
    ["text-blue-800"]="text-primary-800"
    ["text-blue-900"]="text-primary-900"
    ["bg-blue-50"]="bg-primary-50"
    ["bg-blue-100"]="bg-primary-100"
    ["bg-blue-200"]="bg-primary-200"
    ["bg-blue-600"]="bg-primary-600"
    ["border-blue-200"]="border-primary-200"
    ["border-blue-600"]="border-primary-600"
    ["from-blue-600"]="from-primary-600"
    ["to-blue-50"]="to-primary-50"
    ["text-red-700"]="text-danger"
    ["bg-red-50"]="bg-danger-bg"
    ["border-red-200"]="border-danger"
    ["text-green-600"]="text-success"
    ["bg-green-100"]="bg-success-light"
    ["text-purple-600"]="text-info"
    ["bg-purple-100"]="bg-info-light"
)

# Find and replace in all JSX files
echo "Starting color system migration..."

for file in $(find src -name "*.jsx" -type f); do
    echo "Processing: $file"
    for old_color in "${!COLOR_MAPPINGS[@]}"; do
        new_color="${COLOR_MAPPINGS[$old_color]}"
        sed -i "s/$old_color/$new_color/g" "$file"
    done
done

echo "Migration complete!"
