#include  <linux/init.h>
#include  <linux/module.h>
#include  <linux/kernel.h>
#include  <linux/proc_fs.h>
#include  <linux/sched.h>
#include  <linux/fs.h>
#include  <linux/mm.h>
#include  <linux/mman.h>
#include  <linux/mmzone.h>
#include  <linux/swap.h>
#include  <linux/vmstat.h>
#include <linux/moduleparam.h>
#include <asm/uaccess.h>
#include <linux/slab.h> 
#include <linux/string.h>

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Modulo de Memoria");
MODULE_AUTHOR("Julia Sierra");

#define ARCHIVO_PROC "info_memoria"

static int read_p;
static char *texto;



char * itoa (unsigned long value, char *result, int base)
{
    if (base < 2 || base > 36) { *result = '\0'; return result; }
    char* ptr = result, *ptr1 = result, tmp_char;
    unsigned long tmp_value;
    do {
        tmp_value = value;
        value /= base;
        *ptr++ = "zyxwvutsrqponmlkjihgfedcba9876543210123456789abcdefghijklmnopqrstuvwxyz" [35 + (tmp_value - value * base)];
    } while ( value );

    if (tmp_value < 0) *ptr++ = '-';
    *ptr-- = '\0';
    while (ptr1 < ptr) {
        tmp_char = *ptr;
        *ptr--= *ptr1;
        *ptr1++ = tmp_char;
    }
    return result;
}


int abrir_archivo(struct inode *sp_inode, struct file *sp_file)
{
    struct sysinfo i;
    si_meminfo(&i);
    long mem_abs;
    long mem_free;
    char mem_total[10];
    char mem_libre[10];
    char porcentaje[10];
    unsigned long usado;
    unsigned long porcentaje_utilizacion;
    uint64_t percent;
    mem_abs = i.totalram << (PAGE_SHIFT - 10);
    mem_free = i.freeram << (PAGE_SHIFT - 10);
    itoa(mem_abs, mem_total, 10);
    itoa(mem_free, mem_libre, 10);
    usado = mem_abs - mem_free;
    percent = (usado * 100)/mem_abs;
    porcentaje_utilizacion = (long)percent;
    itoa(porcentaje_utilizacion , porcentaje, 10);
    read_p = 1;
    texto = kmalloc(sizeof(char)*300, __GFP_IO | __GFP_FS);
    if(texto == NULL)
    {
        printk("ERROR, en funcion \n");
        return -ENOMEM;
    }
    strcat(texto,"\nCarné: 201503865");
    strcat(texto,"\nNombre: Julia Sierra");
    strcat(texto,"\nSistema Operativo: Centos 7");
    strcat(texto,"\nMemoria Total: ");
    strcat(texto,mem_total);
    strcat(texto,"\nMemoria Libre: ");
    strcat(texto,mem_libre);
    strcat(texto,"\n\% Memoria utilizada: ");
    strcat(texto,porcentaje);
    strcat(texto,"%\n");
    return 0;
}

static ssize_t archivo(struct file *file, char __user *ubuf,size_t count, loff_t *ppos) 
{
    int len = strlen(texto);  
    read_p = !read_p;
    if(read_p)
    {
        return 0;
    }    
    copy_to_user(ubuf, texto, len);
    return len;
}

int liberar_memoria(struct inode *sp_inode, struct file *sp_file)
{
    kfree(texto);
    return 0;
}


static struct file_operations opciones = {
        .open = abrir_archivo,
        .owner = THIS_MODULE,
        .read = archivo,
};


static int proceso_escribir(void){
        struct proc_dir_entry *mem_entry;
        mem_entry = proc_create(ARCHIVO_PROC, 0660, NULL, &opciones);
        return 0;
}

int init_module(void){
    struct sysinfo i;
    si_meminfo(&i);
    printk(KERN_INFO "201503865!\n");
    proceso_escribir();
    return 0;
}

void cleanup_module(void){
    struct sysinfo i;
    si_meminfo(&i);
    remove_proc_entry(ARCHIVO_PROC, NULL);
    printk(KERN_INFO "Sistemas Operativos 1!\n");
}
