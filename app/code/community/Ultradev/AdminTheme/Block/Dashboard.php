<?php
/**
 * Dados reais para o Painel Ultra.
 */
class Ultradev_AdminTheme_Block_Dashboard extends Mage_Adminhtml_Block_Template
{
    /** @var array|null */
    protected $_summary;

    /**
     * Estados que NÃO contam no faturamento. Para ignorar também PIX/boleto
     * ainda não pagos, acrescente Mage_Sales_Model_Order::STATE_PENDING_PAYMENT.
     */
    protected function _excludedStates()
    {
        return array(
            Mage_Sales_Model_Order::STATE_CANCELED,
            Mage_Sales_Model_Order::STATE_CLOSED,
        );
    }

    public function getSummary()
    {
        if ($this->_summary === null) {
            $collection = Mage::getResourceModel('sales/order_collection');
            $collection->addFieldToFilter('state', array('nin' => $this->_excludedStates()));

            $select = $collection->getSelect();
            $select->reset(Zend_Db_Select::COLUMNS)->columns(array(
                'revenue' => new Zend_Db_Expr('SUM(main_table.base_grand_total)'),
                'orders'  => new Zend_Db_Expr('COUNT(main_table.entity_id)'),
            ));

            $row     = $collection->getConnection()->fetchRow($select);
            $revenue = (float)($row['revenue'] ?? 0);
            $orders  = (int)($row['orders'] ?? 0);

            $this->_summary = array(
                'revenue' => $revenue,
                'orders'  => $orders,
                'average' => $orders > 0 ? $revenue / $orders : 0.0,
            );
        }
        return $this->_summary;
    }

    public function getLastOrders()
    {
        return Mage::getResourceModel('sales/order_collection')
            ->setOrder('created_at', 'DESC')
            ->setPageSize(5)
            ->setCurPage(1);
    }

    public function getBestSellers()
    {
        $resource = Mage::getSingleton('core/resource');
        $read     = $resource->getConnection('core_read');

        $select = $read->select()
            ->from(
                array('i' => $resource->getTableName('sales/order_item')),
                array(
                    'product_id',
                    'name'  => new Zend_Db_Expr('MAX(i.name)'),
                    'qty'   => new Zend_Db_Expr('SUM(i.qty_ordered)'),
                    'price' => new Zend_Db_Expr('MAX(i.price)'),
                )
            )
            ->join(
                array('o' => $resource->getTableName('sales/order')),
                'o.entity_id = i.order_id',
                array()
            )
            ->where('o.state NOT IN (?)', $this->_excludedStates())
            ->where('i.parent_item_id IS NULL')
            ->group('i.product_id')
            ->order('qty DESC')
            ->limit(5);

        return $read->fetchAll($select);
    }

    public function getTopTerms()
    {
        return Mage::getResourceModel('catalogsearch/query_collection')
            ->setOrder('popularity', 'DESC')
            ->setPageSize(5)
            ->setCurPage(1);
    }

    public function getRecentTerms()
    {
        return Mage::getResourceModel('catalogsearch/query_collection')
            ->setOrder('updated_at', 'DESC')
            ->setPageSize(5)
            ->setCurPage(1);
    }

    public function getCurrencySymbol()
    {
        try {
            $code = Mage::app()->getBaseCurrencyCode();
            return Mage::app()->getLocale()->currency($code)->getSymbol();
        } catch (Exception $e) {
            return 'R$';
        }
    }

    public function number($value, $decimals = 2)
    {
        return number_format((float)$value, $decimals, ',', '.');
    }

    public function money($value)
    {
        return $this->escapeHtml($this->getCurrencySymbol()) . '&nbsp;' . $this->number($value);
    }

    public function initials($name)
    {
        $parts = preg_split('/\s+/', trim((string)$name));
        $i = mb_substr($parts[0], 0, 1);
        if (isset($parts[1])) {
            $i .= mb_substr($parts[1], 0, 1);
        }
        return mb_strtoupper($i);
    }
}
