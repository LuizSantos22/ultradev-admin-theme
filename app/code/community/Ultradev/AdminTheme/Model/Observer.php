<?php
/**
 * Seleciona o tema "ultra" no admin quando o toggle está ligado.
 */
class Ultradev_AdminTheme_Model_Observer
{
    const XML_PATH_ENABLE = 'admin/ultradev_admintheme/enable';

    public function selectTheme(Varien_Event_Observer $observer)
    {
        if (Mage::getStoreConfigFlag(self::XML_PATH_ENABLE)) {
            Mage::getDesign()->setArea('adminhtml')->setPackageName('default')->setTheme('ultra');
        }
        return $this;
    }
}
