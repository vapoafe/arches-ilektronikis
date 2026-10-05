import { SharedPdfMaterial } from '../types';

const STORAGE_KEY = 'epal_electronics_teacher_materials_v1';

export function getStoredTeacherMaterials(): SharedPdfMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse teacher materials', e);
    return [];
  }
}

export function saveTeacherMaterial(material: SharedPdfMaterial): void {
  try {
    const list = getStoredTeacherMaterials();
    list.unshift(material);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save teacher material', e);
  }
}

export function deleteTeacherMaterial(id: string): void {
  try {
    const list = getStoredTeacherMaterials().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete teacher material', e);
  }
}
